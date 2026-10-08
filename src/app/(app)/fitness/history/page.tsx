import { History, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { getI18n } from "@/lib/i18n/server";
import { tr } from "@/lib/i18n/config";
import { formatDate } from "@/lib/i18n/format";
import { deleteWorkoutAction } from "@/app/actions/fitness";
import { PageHeader } from "@/components/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { LogWorkoutForm } from "@/components/fitness/log-workout-form";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.fitness.historyTitle };
}

export default async function HistoryPage() {
  const user = await requireUser();
  const { t, locale } = await getI18n();
  const sessions = await db.workoutSession.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
    take: 50,
    include: { logs: { include: { exercise: { select: { name: true } } } } },
  });

  return (
    <div className="space-y-6">
      <PageHeader title={t.fitness.historyTitle} subtitle={t.common.selfReported} />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:order-2">
          <CardTitle>{t.fitness.logTitle}</CardTitle>
          <div className="mt-4">
            <LogWorkoutForm labels={{ title: t.fitness.sessionTitle, duration: t.fitness.durationMin, effort: t.fitness.effort, notes: t.fitness.notes, submit: t.common.save, saving: t.common.saving }} />
          </div>
        </Card>
        <div className="space-y-3 lg:col-span-2">
          {sessions.length === 0 ? (
            <EmptyState icon={History} title={t.common.emptyTitle}>{t.fitness.historyEmpty}</EmptyState>
          ) : (
            sessions.map((s) => (
              <Card key={s.id} className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">{s.title}</p>
                  <p className="text-sm text-slate-500">{formatDate(s.date, locale)} · {s.durationMin} {t.common.minutes} · {t.fitness.effort.split("?")[0]}: {s.effort}/5</p>
                  {s.logs.length > 0 && <p className="mt-1 text-xs text-slate-500">{s.logs.map((l) => tr(l.exercise.name, locale)).join(", ")}</p>}
                  {s.notes && <p className="mt-2 text-sm">{s.notes}</p>}
                </div>
                <form action={deleteWorkoutAction}>
                  <input type="hidden" name="id" value={s.id} />
                  <button type="submit" className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950" aria-label={`${t.common.delete}: ${s.title}`}>
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </form>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
