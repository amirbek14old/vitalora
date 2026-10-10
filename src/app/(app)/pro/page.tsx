import Link from "next/link";
import { BadgeCheck, Coins, Crown, Gift, Percent, Sparkles, Bot, Palette } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { getI18n } from "@/lib/i18n/server";
import { fmt } from "@/lib/i18n/config";
import { formatDate } from "@/lib/i18n/format";
import { isPro } from "@/lib/coins";
import { PRO_COIN_PASS_DAYS, PRO_COIN_PASS_PRICE, PRO_PAID_DAYS, PRO_PRICE_USD } from "@/lib/coin-rules";
import { click, payme, proPriceUzs } from "@/lib/payments/config";
import { Card, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { ProCheckout, ClaimBonus } from "@/components/pro/pro-actions";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.pro.title };
}

const PERK_ICONS = [Coins, Gift, Percent, Palette, Bot, BadgeCheck];

export default async function ProPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const user = await requireUser();
  const { t, locale } = await getI18n();
  const { order: orderId } = await searchParams;
  const pro = isPro(user);
  const adult = user.profile?.ageGroup === "ADULT";
  const uzs = proPriceUzs();
  const order = orderId ? await db.payment.findFirst({ where: { id: orderId, userId: user.id } }) : null;
  const providers = [payme.enabled && "PAYME", click.enabled && "CLICK"].filter(Boolean) as ("PAYME" | "CLICK")[];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 p-6 text-white shadow-sm sm:p-8">
        <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider opacity-90"><Crown className="h-4 w-4" aria-hidden />VITALORA Pro</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{t.pro.headline}</h1>
        <p className="mt-2 max-w-2xl opacity-95">{t.pro.subtitle}</p>
        <p className="mt-5 text-4xl font-extrabold">${PRO_PRICE_USD}<span className="ml-2 text-lg font-semibold opacity-90">/ {fmt(t.pro.days, { n: PRO_PAID_DAYS })}</span></p>
        <p className="text-sm opacity-90">≈ {uzs.toLocaleString("ru-RU")} {t.pro.som} · {t.pro.noAutoRenew}</p>
        {pro && (
          <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm font-semibold">
            <Sparkles className="h-4 w-4" aria-hidden />{fmt(t.shop.proActiveUntil, { date: formatDate(user.proUntil!, locale) })}
          </p>
        )}
      </section>

      {order && (
        <Alert tone={order.status === "PAID" ? "success" : order.status === "PENDING" ? "info" : "error"}>
          {order.status === "PAID" ? t.pro.orderPaid : order.status === "PENDING" ? t.pro.orderPending : t.pro.orderCancelled}
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardTitle>{t.pro.perksTitle}</CardTitle>
          <ul className="mt-4 space-y-4">
            {t.pro.perks.map((perk, i) => {
              const Icon = PERK_ICONS[i] ?? Sparkles;
              return (
                <li key={perk.title} className="flex gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"><Icon className="h-5 w-5" aria-hidden /></span>
                  <div><p className="font-semibold">{perk.title}</p><p className="text-sm text-slate-600 dark:text-slate-300">{perk.text}</p></div>
                </li>
              );
            })}
          </ul>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          <Card className="space-y-3">
            <CardTitle>{pro ? fmt(t.pro.extend, { n: PRO_PAID_DAYS }) : fmt(t.pro.payCta, { usd: PRO_PRICE_USD })}</CardTitle>
            {!adult ? (
              <Alert tone="info">{t.pro.adultsOnly}</Alert>
            ) : providers.length === 0 ? (
              <Alert tone="info">{t.pro.notConfigured}</Alert>
            ) : (
              <ProCheckout providers={providers} labels={{ PAYME: t.pro.payWithPayme, CLICK: t.pro.payWithClick, redirecting: t.pro.redirecting }} />
            )}
            <p className="text-xs text-slate-500">{t.pro.finePrint}</p>
          </Card>

          <Card className="space-y-2">
            <CardTitle className="flex items-center gap-2"><Coins className="h-5 w-5 text-amber-500" aria-hidden />{t.pro.coinTitle}</CardTitle>
            <p className="text-sm text-slate-600 dark:text-slate-300">{fmt(t.pro.coinText, { price: PRO_COIN_PASS_PRICE, n: PRO_COIN_PASS_DAYS })}</p>
            <Link href="/shop" className="text-sm font-medium text-brand-700 underline dark:text-brand-400">{t.pro.toShop}</Link>
          </Card>

          {pro && (
            <Card className="space-y-2">
              <CardTitle className="flex items-center gap-2"><Gift className="h-5 w-5 text-rose-500" aria-hidden />{t.pro.bonusTitle}</CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-300">{t.pro.bonusText}</p>
              <ClaimBonus label={t.pro.claimBonus} />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
