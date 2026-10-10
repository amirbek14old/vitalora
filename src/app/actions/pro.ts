"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { assertUser } from "@/lib/auth/guards";
import { awardCoins, isPro } from "@/lib/coins";
import { rateLimit } from "@/lib/rate-limit";
import { audit } from "@/lib/audit";
import { getI18n } from "@/lib/i18n/server";
import { fmt } from "@/lib/i18n/config";
import { appUrl, click, clickCheckoutUrl, payme, paymeCheckoutUrl, proPriceUzs, PRO_PRODUCT } from "@/lib/payments/config";
import type { ActionState } from "@/lib/action-state";

/** Creates an order and sends the user to the Payme/Click checkout page. */
export async function startProCheckoutAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await assertUser();
  const { t, locale } = await getI18n();
  // Payments are for adults only — teens should ask a parent to pay from the parent's own account.
  if (user.profile?.ageGroup !== "ADULT") return { error: t.pro.adultsOnly };
  const provider = formData.get("provider") === "CLICK" ? "CLICK" : "PAYME";
  if (provider === "PAYME" ? !payme.enabled : !click.enabled) return { error: t.pro.notConfigured };
  const rl = await rateLimit(`checkout:${user.id}`, 10, 60 * 60);
  if (!rl.ok) return { error: t.common.rateLimited };

  const amountUzs = proPriceUzs();
  const order = await db.payment.create({ data: { userId: user.id, provider, product: PRO_PRODUCT, amountUzs } });
  await audit("pro.checkout", user.id, `${provider}:${order.id}`);
  const back = `${appUrl()}/pro?order=${order.id}`;
  redirect(provider === "PAYME" ? paymeCheckoutUrl(order.id, amountUzs, back, locale === "uz" ? "uz" : locale === "en" ? "en" : "ru") : clickCheckoutUrl(order.id, amountUzs, back));
}

/** Pro perk: a daily coin bonus. */
export async function claimProBonusAction(_prev: ActionState): Promise<ActionState> {
  const user = await assertUser();
  const { t } = await getI18n();
  if (!isPro(user)) return { error: t.shop.needPro };
  const today = new Date().toISOString().slice(0, 10);
  const n = await awardCoins(user.id, "pro_daily", `pro_daily:${today}`);
  revalidatePath("/", "layout");
  return n ? { ok: true, message: fmt(t.coins.earned, { n }) } : { error: t.pro.bonusClaimed };
}
