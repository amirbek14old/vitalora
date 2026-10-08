import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { getI18n } from "@/lib/i18n/server";
import { tr } from "@/lib/i18n/config";
import { formatDate } from "@/lib/i18n/format";
import { evaluateAchievements } from "@/lib/achievements";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { AchievementIcon } from "@/components/achievement-icon";
import { cn } from "@/lib/utils";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.achievements.title };
}

export default async function AchievementsPage() {
  const user = await requireUser();
  const { t, locale } = await getI18n();
  await evaluateAchievements(user.id); // catch up on anything earned elsewhere
  const [all, earned] = await Promise.all([
    db.achievement.findMany({ orderBy: { code: "asc" } }),
    db.userAchievement.findMany({ where: { userId: user.id } }),
  ]);
  const earnedMap = new Map(earned.map((e) => [e.achievementId, e.earnedAt]));
  const sorted = [...all].sort((a, b) => Number(earnedMap.has(b.id)) - Number(earnedMap.has(a.id)));

  return (
    <div className="space-y-6">
      <PageHeader title={t.achievements.title} subtitle={t.achievements.subtitle} />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((a) => {
          const at = earnedMap.get(a.id);
          return (
            <li key={a.id}>
              <Card className={cn("flex items-start gap-4", !at && "opacity-60")}>
                <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl", at ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200" : "bg-slate-100 text-slate-400 dark:bg-slate-800")}>
                  <AchievementIcon name={a.icon} className="h-6 w-6" />
                </span>
                <div>
                  <h2 className="font-semibold">{tr(a.title, locale)}</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{tr(a.description, locale)}</p>
                  <p className="mt-1 text-xs text-slate-500">{at ? `${t.achievements.earned}: ${formatDate(at, locale)}` : t.achievements.locked}</p>
                </div>
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
