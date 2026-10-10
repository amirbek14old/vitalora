import Link from "next/link";
import { Salad, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser, isTeen } from "@/lib/auth/guards";
import { getI18n } from "@/lib/i18n/server";
import { formatDate } from "@/lib/i18n/format";
import { term } from "@/lib/i18n/terms";
import { deleteMealAction } from "@/app/actions/meals";
import { PageHeader } from "@/components/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { FoodScanner } from "@/components/nutrition/food-scanner";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.foodScan.title };
}

const GROUPS = ["vegetables", "fruits", "grains", "protein", "dairy", "fats", "sweets", "drinks", "mixed"];

export default async function FoodScanPage() {
  const user = await requireUser();
  const { t, locale } = await getI18n();
  const teen = isTeen(user);
  const meals = await db.mealLog.findMany({ where: { userId: user.id }, orderBy: { date: "desc" }, take: 10 });
  const groupLabels = Object.fromEntries(GROUPS.map((g) => [g, term(g, locale)]));

  return (
    <div className="space-y-6">
      <PageHeader title={t.foodScan.title} subtitle={t.foodScan.subtitle} />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          {user.preference?.aiConsent ? (
            <FoodScanner teen={teen} labels={{ ...t.foodScan, groupLabels, errorGeneric: t.common.errorGeneric, notConfigured: t.assistant.notConfigured, rateLimited: t.assistant.rateLimited, aiErrors: t.assistant.aiErrors }} />
          ) : (
            <Alert tone="info">
              {t.foodScan.consentNeeded} <Link href="/settings" className="font-medium underline">{t.assistant.goSettings}</Link>
            </Alert>
          )}
        </Card>
        <Card>
          <CardTitle>{t.foodScan.journal}</CardTitle>
          <div className="mt-3 space-y-3">
            {meals.length === 0 ? (
              <EmptyState icon={Salad} title={t.foodScan.journalEmpty} />
            ) : (
              meals.map((m) => {
                const items = (Array.isArray(m.items) ? m.items : []) as { name?: string; foodGroup?: string }[];
                return (
                  <div key={m.id} className="flex items-start justify-between gap-2 rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800/50">
                    <div>
                      <p className="font-medium">{items.map((i) => i.name).filter(Boolean).join(", ")}</p>
                      <p className="text-xs text-slate-500">
                        {formatDate(m.date, locale, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        {!teen && m.totalKcal != null && <> · ≈{m.totalKcal} kcal</>}
                      </p>
                    </div>
                    <form action={deleteMealAction}>
                      <input type="hidden" name="id" value={m.id} />
                      <button type="submit" className="rounded p-1 text-slate-500 hover:text-red-700" aria-label={t.common.delete}><Trash2 className="h-4 w-4" aria-hidden /></button>
                    </form>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
