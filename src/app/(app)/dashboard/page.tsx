import Link from "next/link";
import { Activity, BookOpen, Dumbbell, ListChecks, Moon, Sparkles } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser, isTeen } from "@/lib/auth/guards";
import { getI18n } from "@/lib/i18n/server";
import { fmt, tr } from "@/lib/i18n/config";
import { weekdayShort } from "@/lib/i18n/format";
import { getWeeklyStats } from "@/lib/stats";
import { recommend } from "@/lib/recommendations";
import { formatHours, isoDate, startOfDayUTC, startOfWeekUTC } from "@/lib/utils";
import { Card, CardTitle } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { WeeklyChart } from "@/components/charts/weekly-chart";
import { HabitToggle } from "@/components/habit-toggle";
import { AchievementIcon } from "@/components/achievement-icon";
import { AIInsight } from "@/components/ai-insight";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.nav.dashboard };
}

export default async function DashboardPage() {
  const user = await requireUser();
  const { t, locale } = await getI18n();
  const teen = isTeen(user);
  const today = startOfDayUTC(new Date());
  const weekStart = startOfWeekUTC(today);

  const [{ points, snapshot }, habits, achievements, nextLesson] = await Promise.all([
    getWeeklyStats(user.id),
    db.habit.findMany({
      where: { userId: user.id, archived: false, paused: false },
      include: { entries: { where: { date: { gte: weekStart } } } },
      orderBy: { createdAt: "asc" },
      take: 6,
    }),
    db.userAchievement.findMany({ where: { userId: user.id }, include: { achievement: true }, orderBy: { earnedAt: "desc" }, take: 3 }),
    db.lesson.findFirst({
      where: { course: { published: true }, progress: { none: { userId: user.id } } },
      include: { course: true },
      orderBy: [{ course: { order: "asc" } }, { order: "asc" }],
    }),
  ]);

  const recs = recommend(snapshot, teen);
  const chartData = points.map((p) => ({ label: weekdayShort(p.date, locale), minutes: p.minutes, sleepHours: p.sleepHours }));
  const summary = points.map((p) => `${weekdayShort(p.date, locale)}: ${p.minutes} ${t.common.minutes}${p.sleepHours != null ? `, ${p.sleepHours} ${t.common.hours}` : ""}`).join("; ");
  const todayIso = isoDate(today);

  const stats = [
    { icon: Activity, label: t.dashboard.activeMinutes, value: `${snapshot.activeMinutes}`, unit: t.common.minutes },
    { icon: Dumbbell, label: t.dashboard.workouts, value: `${snapshot.workouts}`, unit: "" },
    { icon: Moon, label: t.dashboard.avgSleep, value: snapshot.avgSleepMinutes ? formatHours(snapshot.avgSleepMinutes) : "—", unit: snapshot.avgSleepMinutes ? t.common.hours : "" },
    { icon: ListChecks, label: t.dashboard.habitsDone, value: `${snapshot.habitCheckins}`, unit: "" },
    { icon: BookOpen, label: t.dashboard.lessonsDone, value: `${snapshot.lessonsThisWeek}`, unit: "" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">{fmt(t.dashboard.greeting, { name: user.profile?.displayName ?? "" })}</h1>
        <p className="text-slate-600 dark:text-slate-300">{t.dashboard.subtitle} <span className="text-xs">({t.common.selfReported})</span></p>
      </div>

      <section aria-label={t.common.thisWeek} className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => (
          <Card key={s.label} className="p-4">
            <s.icon className="h-5 w-5 text-brand-700 dark:text-brand-400" aria-hidden />
            <p className="mt-2 text-2xl font-bold">{s.value} <span className="text-sm font-normal text-slate-500">{s.unit}</span></p>
            <p className="text-xs text-slate-600 dark:text-slate-400">{s.label}</p>
          </Card>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardTitle>{t.dashboard.weeklyChart}</CardTitle>
          <WeeklyChart data={chartData} minutesLabel={t.dashboard.chartMinutes} sleepLabel={t.dashboard.chartSleep} summary={summary} />
        </Card>

        <Card>
          <CardTitle>{t.dashboard.todayHabits}</CardTitle>
          {habits.length === 0 ? (
            <div className="mt-3 text-sm text-slate-600 dark:text-slate-300">
              <p>{t.dashboard.noHabits}</p>
              <ButtonLink href="/habits" size="sm" variant="secondary" className="mt-3">{t.dashboard.addHabit}</ButtonLink>
            </div>
          ) : (
            <ul className="mt-3 space-y-3">
              {habits.map((h) => {
                const done = h.entries.some((e) => isoDate(e.date) === todayIso);
                return (
                  <li key={h.id} className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">{h.title}</p>
                      <p className="text-xs text-slate-500">{fmt(t.habits.weekProgress, { done: h.entries.length, target: h.targetPerWeek })}</p>
                    </div>
                    <HabitToggle habitId={h.id} date={todayIso} done={done} label={fmt(done ? t.habits.undo : t.habits.markDone, { day: t.common.today })} />
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardTitle>{t.dashboard.recommendations}</CardTitle>
          <ul className="mt-3 space-y-2 text-sm">
            {recs.map((r) => (
              <li key={r} className="rounded-xl bg-brand-50 p-3 text-brand-900 dark:bg-brand-900/30 dark:text-brand-100">{t.dashboard.rec[r]}</li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardTitle className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-brand-600" aria-hidden />{t.dashboard.aiInsight}</CardTitle>
          <div className="mt-3">
            {user.preference?.aiConsent ? (
              <AIInsight labels={{ button: t.dashboard.aiInsightButton, loading: t.assistant.thinking, error: t.common.errorGeneric, notConfigured: t.assistant.notConfigured, rateLimited: t.assistant.rateLimited, disclaimer: t.common.notMedical }} />
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {t.dashboard.aiInsightConsent} <Link href="/settings" className="underline">{t.nav.settings}</Link>
              </p>
            )}
          </div>
        </Card>

        <Card>
          <CardTitle>{t.dashboard.recentAchievements}</CardTitle>
          {achievements.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{t.dashboard.noAchievements}</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {achievements.map((a) => (
                <li key={a.id} className="flex items-center gap-3 text-sm">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200">
                    <AchievementIcon name={a.achievement.icon} className="h-4 w-4" />
                  </span>
                  {tr(a.achievement.title, locale)}
                </li>
              ))}
            </ul>
          )}
          {nextLesson && (
            <div className="mt-5 border-t border-slate-200 pt-4 dark:border-slate-700">
              <p className="text-xs uppercase tracking-wide text-slate-500">{t.dashboard.continueLearning}</p>
              <Link href={`/academy/${nextLesson.course.slug}/${nextLesson.slug}`} className="mt-1 block font-medium text-brand-700 underline dark:text-brand-400">
                {tr(nextLesson.title, locale)}
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
