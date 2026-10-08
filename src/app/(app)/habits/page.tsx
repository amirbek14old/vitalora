import { ListChecks, Pause, Play, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { getI18n } from "@/lib/i18n/server";
import { fmt } from "@/lib/i18n/config";
import { weekdayShort } from "@/lib/i18n/format";
import { isoDate, lastNDays, startOfWeekUTC } from "@/lib/utils";
import { deleteHabitAction, setHabitPausedAction } from "@/app/actions/habits";
import { PageHeader } from "@/components/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/ui/empty-state";
import { HabitToggle } from "@/components/habit-toggle";
import { HabitForm } from "@/components/habits/habit-form";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.habits.title };
}

export default async function HabitsPage() {
  const user = await requireUser();
  const { t, locale } = await getI18n();
  const days = lastNDays(7);
  const weekStart = startOfWeekUTC(new Date());
  const habits = await db.habit.findMany({
    where: { userId: user.id, archived: false },
    include: { entries: { where: { date: { gte: days[0] < weekStart ? days[0] : weekStart } } } },
    orderBy: [{ paused: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div className="space-y-6">
      <PageHeader title={t.habits.title} subtitle={t.habits.subtitle} />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <p className="text-sm text-brand-800 dark:text-brand-200">{t.habits.encouragement}</p>
          {habits.length === 0 ? (
            <EmptyState icon={ListChecks} title={t.habits.empty} />
          ) : (
            habits.map((h) => {
              const doneDates = new Set(h.entries.map((e) => isoDate(e.date)));
              const thisWeek = h.entries.filter((e) => e.date >= weekStart).length;
              return (
                <Card key={h.id} className={h.paused ? "opacity-70" : undefined}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="font-semibold">{h.title}</h2>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <Badge tone="slate">{t.habits.categories[h.category]}</Badge>
                        {h.paused && <Badge tone="amber">{t.habits.paused}</Badge>}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <form action={setHabitPausedAction}>
                        <input type="hidden" name="habitId" value={h.id} />
                        <input type="hidden" name="paused" value={String(!h.paused)} />
                        <button type="submit" className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
                          {h.paused ? <Play className="h-4 w-4" aria-hidden /> : <Pause className="h-4 w-4" aria-hidden />}
                          {h.paused ? t.habits.resume : t.habits.pause}
                        </button>
                      </form>
                      <form action={deleteHabitAction}>
                        <input type="hidden" name="habitId" value={h.id} />
                        <button type="submit" className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-slate-600 hover:bg-red-50 hover:text-red-700 dark:text-slate-300 dark:hover:bg-red-950">
                          <Trash2 className="h-4 w-4" aria-hidden />{t.habits.remove}
                        </button>
                      </form>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {days.map((d) => {
                      const key = isoDate(d);
                      const done = doneDates.has(key);
                      const label = weekdayShort(key, locale);
                      return (
                        <div key={key} className="flex flex-col items-center gap-1">
                          <span className="text-xs text-slate-500" aria-hidden>{label}</span>
                          <HabitToggle habitId={h.id} date={key} done={done} disabled={h.paused} label={fmt(done ? t.habits.undo : t.habits.markDone, { day: label })} />
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4">
                    <Progress value={Math.min(thisWeek, h.targetPerWeek)} max={h.targetPerWeek} label={h.title} />
                    <p className="mt-1 text-xs text-slate-500">{fmt(t.habits.weekProgress, { done: thisWeek, target: h.targetPerWeek })}</p>
                  </div>
                </Card>
              );
            })
          )}
        </div>
        <Card className="h-fit">
          <CardTitle>{t.habits.add}</CardTitle>
          <div className="mt-4">
            <HabitForm categories={t.habits.categories} labels={{ name: t.habits.name, category: t.habits.category, target: t.habits.target, add: t.habits.add, saving: t.common.saving }} />
          </div>
        </Card>
      </div>
    </div>
  );
}
