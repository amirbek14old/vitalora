import "server-only";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { startOfDayUTC } from "@/lib/utils";
import { REWARDS, type RewardReason, type RewardRule, PRO_COIN_MULTIPLIER, PRO_COIN_PASS_DAYS, shopPrice } from "@/lib/coin-rules";

export { REWARDS };

export function isPro(user: { proUntil: Date | null }): boolean {
  return !!user.proUntil && user.proUntil > new Date();
}

/**
 * Award coins for a completed task. Idempotent per refKey (a habit day, a lesson, a workout id…),
 * and limited by per-day caps so coins reflect real, healthy activity — not grinding.
 * Returns the number of coins awarded (0 if capped or already rewarded).
 */
export async function awardCoins(userId: string, reason: RewardReason, refKey: string, amountOverride?: number): Promise<number> {
  const rule: RewardRule = REWARDS[reason];
  let amount = Math.max(0, Math.round(amountOverride ?? rule.amount));
  if (amount === 0) return 0;

  const since = startOfDayUTC(new Date());

  try {
    return await db.$transaction(async (tx) => {
      // Serialize rewards per user: concurrent requests (spam-clicking "Save") wait here,
      // so the daily-cap check below can't be raced.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${"coins:" + userId}))`;
      // Pro perk: double coins (and a doubled coin cap) on every task.
      let mult = 1;
      if (!rule.noProBonus) {
        const u = await tx.user.findUnique({ where: { id: userId }, select: { proUntil: true } });
        if (u && isPro(u)) mult = PRO_COIN_MULTIPLIER;
      }
      amount *= mult;
      if (rule.maxPerDay || rule.maxCoinsPerDay) {
        const today = await tx.coinTransaction.aggregate({
          where: { userId, reason, createdAt: { gte: since } },
          _count: true,
          _sum: { amount: true },
        });
        if (rule.maxPerDay && today._count >= rule.maxPerDay) return 0;
        if (rule.maxCoinsPerDay) {
          const left = rule.maxCoinsPerDay * mult - (today._sum.amount ?? 0);
          if (left <= 0) return 0;
          amount = Math.min(amount, left);
        }
      }
      await tx.coinTransaction.create({ data: { userId, amount, reason, refKey } });
      await tx.user.update({ where: { id: userId }, data: { coins: { increment: amount } } });
      return amount;
    });
  } catch (err) {
    // Unique (userId, refKey) → already rewarded for this exact task.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") return 0;
    throw err;
  }
}

export type PurchaseResult = { ok: true; price: number } | { ok: false; error: "not_found" | "owned" | "need_pro" | "insufficient" };

/** Buy a shop item atomically: the balance check and the deduction are one conditional UPDATE.
 *  Cosmetics are 20% cheaper for Pro. The coin Pro pass (500 coins → 3 days) is never discounted. */
export async function purchaseItem(userId: string, code: string): Promise<PurchaseResult> {
  const item = await db.shopItem.findFirst({ where: { code, active: true } });
  if (!item) return { ok: false, error: "not_found" };
  const user = await db.user.findUniqueOrThrow({ where: { id: userId }, select: { proUntil: true } });
  const pro = isPro(user);
  const isPass = item.kind === "PRO_PASS";
  if (item.proOnly && !pro) return { ok: false, error: "need_pro" };
  if (!isPass) {
    const owned = await db.userItem.findUnique({ where: { userId_itemId: { userId, itemId: item.id } } });
    if (owned) return { ok: false, error: "owned" };
  }
  const price = isPass ? item.price : shopPrice(item.price, pro);

  return db.$transaction(async (tx) => {
    const charged = await tx.user.updateMany({ where: { id: userId, coins: { gte: price } }, data: { coins: { decrement: price } } });
    if (charged.count === 0) return { ok: false, error: "insufficient" } as const;
    await tx.coinTransaction.create({ data: { userId, amount: -price, reason: isPass ? "pro" : "purchase", refKey: null } });
    if (isPass) await extendPro(tx, userId, PRO_COIN_PASS_DAYS);
    else await tx.userItem.create({ data: { userId, itemId: item.id } });
    return { ok: true, price } as const;
  });
}

/** Extends Pro by `days` from now (or from the current end date if Pro is still active). */
export async function extendPro(tx: Prisma.TransactionClient, userId: string, days: number): Promise<Date> {
  const u = await tx.user.findUniqueOrThrow({ where: { id: userId }, select: { proUntil: true } });
  const now = new Date();
  const base = u.proUntil && u.proUntil > now ? u.proUntil : now;
  const until = new Date(base.getTime() + days * 86_400_000);
  await tx.user.update({ where: { id: userId }, data: { proUntil: until } });
  return until;
}

/** Takes back the days of a refunded pass. */
export async function shortenPro(tx: Prisma.TransactionClient, userId: string, days: number): Promise<void> {
  const u = await tx.user.findUniqueOrThrow({ where: { id: userId }, select: { proUntil: true } });
  if (!u.proUntil) return;
  await tx.user.update({ where: { id: userId }, data: { proUntil: new Date(u.proUntil.getTime() - days * 86_400_000) } });
}

const EQUIP_FIELD = {
  FRAME: "equippedFrame",
  BANNER: "equippedBanner",
  NAME_COLOR: "equippedNameColor",
  BADGE: "equippedBadge",
} as const;

/** Equip an owned item, or pass code=null to clear that slot. */
export async function equipItem(userId: string, kind: keyof typeof EQUIP_FIELD, code: string | null): Promise<boolean> {
  if (code) {
    const owned = await db.userItem.findFirst({ where: { userId, item: { code, kind } } });
    if (!owned) return false;
  }
  await db.profile.update({ where: { userId }, data: { [EQUIP_FIELD[kind]]: code } });
  return true;
}
