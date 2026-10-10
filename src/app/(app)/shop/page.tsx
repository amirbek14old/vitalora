import { Coins, Crown } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { getI18n } from "@/lib/i18n/server";
import { fmt, tr } from "@/lib/i18n/config";
import { formatDate } from "@/lib/i18n/format";
import { isPro, REWARDS } from "@/lib/coins";
import { PRO_COIN_PASS_CODE, PRO_PAID_DAYS, PRO_PRICE_USD, shopPrice } from "@/lib/coin-rules";
import { ButtonLink } from "@/components/ui/button";
import { BANNERS, styleFromCode } from "@/lib/cosmetics";
import { PageHeader } from "@/components/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { UserAvatar, DisplayName, ProfileBadge } from "@/components/user-avatar";
import { BuyProButton, ShopItemCard } from "@/components/shop/shop-item-card";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.shop.title };
}

const KINDS = ["FRAME", "BANNER", "NAME_COLOR", "BADGE"] as const;
const equipField = { FRAME: "equippedFrame", BANNER: "equippedBanner", NAME_COLOR: "equippedNameColor", BADGE: "equippedBadge" } as const;

export default async function ShopPage() {
  const user = await requireUser();
  const { t, locale } = await getI18n();
  const [items, owned, history, avatar] = await Promise.all([
    db.shopItem.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    db.userItem.findMany({ where: { userId: user.id }, select: { itemId: true } }),
    db.coinTransaction.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 12 }),
    db.avatar.findUnique({ where: { userId: user.id }, select: { updatedAt: true } }),
  ]);
  const ownedIds = new Set(owned.map((o) => o.itemId));
  const pro = isPro(user);
  const proItem = items.find((i) => i.code === PRO_COIN_PASS_CODE);
  const profile = user.profile!;
  const me = { id: user.id, displayName: profile.displayName, avatarVersion: avatar?.updatedAt.getTime() ?? null, preset: profile.avatarPreset };
  const labels = { buy: t.shop.buy, owned: t.shop.owned, equip: t.shop.equip, equipped: t.shop.equipped, unequip: t.shop.unequip, proOnly: t.shop.proOnly };
  const earnRows = (Object.keys(REWARDS) as (keyof typeof REWARDS)[]).map((k) => ({ key: k, text: t.coins.rules[k] }));

  return (
    <div className="space-y-8">
      <PageHeader title={t.shop.title} subtitle={t.shop.subtitle} />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300"><Coins className="h-7 w-7" aria-hidden /></span>
          <div>
            <p className="text-sm text-slate-500">{t.coins.balance}</p>
            <p className="text-3xl font-bold">{user.coins}</p>
          </div>
        </Card>
        <div className="rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 p-5 text-white shadow-sm lg:col-span-2">
          <p className="flex items-center gap-2 text-lg font-bold"><Crown className="h-5 w-5" aria-hidden />{t.shop.proTitle}</p>
          <p className="mt-1 text-sm opacity-95">{t.shop.proText}</p>
          <ul className="mt-3 grid gap-1 text-sm sm:grid-cols-2">{t.pro.perks.map((p) => <li key={p.title}>✓ {p.title}</li>)}</ul>
          {pro && <p className="mt-3 text-sm font-semibold">{fmt(t.shop.proActiveUntil, { date: formatDate(user.proUntil!, locale) })}</p>}
          <div className="mt-4 flex flex-wrap items-start gap-3">
            <ButtonLink href="/pro" size="lg" className="gap-3 bg-white text-orange-700 shadow-sm hover:bg-orange-50">
              <Crown className="h-5 w-5" aria-hidden />
              <span className="flex items-start leading-none"><span className="mt-0.5 text-xs font-bold">$</span><span className="text-2xl font-black">{PRO_PRICE_USD}</span></span>
              <span className="text-left text-sm font-semibold leading-tight">{fmt(t.pro.days, { n: PRO_PAID_DAYS })}</span>
            </ButtonLink>
            {proItem && (
              <BuyProButton code={proItem.code} price={proItem.price} label={t.shop.buyPro} canBuy={user.coins >= proItem.price} disabledLabel={fmt(t.shop.needMore, { n: proItem.price - user.coins })} />
            )}
          </div>
        </div>
      </div>

      {KINDS.map((kind) => {
        const list = items.filter((i) => i.kind === kind);
        if (!list.length) return null;
        return (
          <section key={kind} aria-labelledby={`k-${kind}`}>
            <h2 id={`k-${kind}`} className="mb-3 text-xl font-semibold">{t.shop.kinds[kind]}</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {list.map((item) => {
                const isOwned = ownedIds.has(item.id);
                const equipped = profile[equipField[kind]] === item.code;
                const preview =
                  kind === "FRAME" ? <UserAvatar user={{ ...me, frame: item.code }} size="md" /> :
                  kind === "BANNER" ? <div className="h-16 w-full rounded-lg" style={{ background: BANNERS[styleFromCode(item.code) ?? ""] }} /> :
                  kind === "NAME_COLOR" ? <DisplayName name={profile.displayName} color={item.code} className="text-lg" /> :
                  <ProfileBadge code={item.code} size={30} label={tr(item.name, locale)} />;
                return (
                  <ShopItemCard
                    key={item.id}
                    code={item.code}
                    kind={kind}
                    name={tr(item.name, locale)}
                    price={shopPrice(item.price, pro)}
                    fullPrice={item.price}
                    proOnly={item.proOnly}
                    owned={isOwned}
                    equipped={equipped}
                    canBuy={user.coins >= shopPrice(item.price, pro) && (!item.proOnly || pro)}
                    preview={preview}
                    labels={labels}
                  />
                );
              })}
            </div>
          </section>
        );
      })}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>{t.coins.howToEarn}</CardTitle>
          <ul className="mt-3 space-y-2 text-sm">
            {earnRows.map((r) => <li key={r.key} className="flex items-start gap-2"><Coins className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-hidden />{r.text}</li>)}
          </ul>
          <p className="mt-3 text-xs text-slate-500">{t.coins.fairPlay}</p>
        </Card>
        <Card>
          <CardTitle>{t.coins.history}</CardTitle>
          {history.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">{t.coins.historyEmpty}</p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-200 text-sm dark:divide-slate-700">
              {history.map((h) => (
                <li key={h.id} className="flex justify-between py-2">
                  <span>{t.coins.reasons[h.reason as keyof typeof t.coins.reasons] ?? h.reason} <span className="text-xs text-slate-500">· {formatDate(h.createdAt, locale, { day: "numeric", month: "short" })}</span></span>
                  <span className={h.amount >= 0 ? "font-semibold text-emerald-600" : "font-semibold text-slate-500"}>{h.amount > 0 ? `+${h.amount}` : h.amount}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
