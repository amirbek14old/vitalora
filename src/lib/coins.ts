import "server-only";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { startOfDayUTC } from "@/lib/utils";
import { REWARDS, type RewardReason, type RewardRule, PRO_PASS_DAYS } from "@/lib/coin-rules";

export { REWARDS, PRO_PASS_DAYS };

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
  if (rule.maxPerDay || rule.maxCoinsPerDay) {
    const today = await db.coinTransaction.aggregate({
      where: { userId, reason, createdAt: { gte: since } },
      _count: true,
      _sum: { amount: true },
    });
    if (rule.maxPerDay && today._count >= rule.maxPerDay) return 0;
    if (rule.maxCoinsPerDay) {
      const left = rule.maxCoinsPerDay - (today._sum.amount ?? 0);
      if (left <= 0) return 0;
      amount = Math.min(amount, left);
    }
  }

  try {
    await db.$transaction([
      db.coinTransaction.create({ data: { userId, amount, reason, refKey } }),
      db.user.update({ where: { id: userId }, data: { coins: { increment: amount } } }),
    ]);
    return amount;
  } catch (err) {
    // Unique (userId, refKey) → already rewarded for this exact task.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") return 0;
    throw err;
  }
}

export type PurchaseResult = { ok: true } | { ok: false; error: "not_found" | "owned" | "need_pro" | "insufficient" };

/** Buy a shop item atomically: the balance check and the deduction are one conditional UPDATE. */
export async function purchaseItem(userId: string, code: string): Promise<PurchaseResult> {
  const item = await db.shopItem.findFirst({ where: { code, active: true } });
  if (!item) return { ok: false, error: "not_found" };
  const user = await db.user.findUniqueOrThrow({ where: { id: userId }, select: { proUntil: true } });
  if (item.proOnly && !isPro(user)) return { ok: false, error: "need_pro" };
  if (item.kind !== "PRO_PASS") {
    const owned = await db.userItem.findUnique({ where: { userId_itemId: { userId, itemId: item.id } } });
    if (owned) return { ok: false, error: "owned" };
  }

  return db.$transaction(async (tx) => {
    const charged = await tx.user.updateMany({ where: { id: userId, coins: { gte: item.price } }, data: { coins: { decrement: item.price } } });
    if (charged.count === 0) return { ok: false, error: "insufficient" } as const;
    await tx.coinTransaction.create({ data: { userId, amount: -item.price, reason: item.kind === "PRO_PASS" ? "pro" : "purchase", refKey: null } });
    if (item.kind === "PRO_PASS") {
      const base = user.proUntil && user.proUntil > new Date() ? user.proUntil : new Date();
      await tx.user.update({ where: { id: userId }, data: { proUntil: new Date(base.getTime() + PRO_PASS_DAYS * 86_400_000) } });
    } else {
      await tx.userItem.create({ data: { userId, itemId: item.id } });
    }
    return { ok: true } as const;
  });
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
