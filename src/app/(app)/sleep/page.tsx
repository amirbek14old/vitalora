import { Moon, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { getI18n } from "@/lib/i18n/server";
import { formatDate } from "@/lib/i18n/format";
import { addDays, formatHours, isoDate, startOfDayUTC } from "@/lib/utils";
import { deleteSleepAction } from "@/app/actions/sleep";
import { PageHeader } from "@/components/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { SleepForm } from "@/components/sleep/sleep-form";
import { BedtimeRoutine } from "@/components/sleep/bedtime-routine";
import { BoxBreathing } from "@/components/sleep/box-breathing";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.sleep.title };
}

export default async function SleepPage() {
  const user = await requireUser();
  const { t, locale } = await getI18n();
  const today = startOfDayUTC(new Date());
  const logs = await db.sleepLog.findMany({ where: { userId: user.id }, orderBy: { date: "desc" }, take: 14 });
  const week = logs.filter((l) => l.date >= addDays(today, -6));
  const avgMin = week.length ? Math.round(week.reduce((a, l) => a + l.minutes, 0) / week.length) : null;
  const avgQ = week.length ? (week.reduce((a, l) => a + l.quality, 0) / week.length).toFixed(1) : null;

  const stored = user.preference?.bedtimeRoutine;
  const routine = Array.isArray(stored)
    ? (stored as { id: string; label: string; done: boolean }[])
    : t.sleep.defaultRoutine.map((label, i) => ({ id: `d${i}`, label, done: false }));

  return (
    <div className="space-y-6">
      <PageHeader title={t.sleep.title} subtitle={t.sleep.subtitle} />
      <Alert tone="info">{t.sleep.noDiagnosis} {t.common.selfReported}.</Alert>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardTitle>{t.sleep.logTitle}</CardTitle>
          <div className="mt-4">
            <SleepForm today={isoDate(today)} labels={{ date: t.sleep.date, bedtime: t.sleep.bedtime, wakeTime: t.sleep.wakeTime, quality: t.sleep.quality, notes: t.sleep.notes, save: t.common.save, saving: t.common.saving }} />
          </div>
        </Card>

        <Card>
          <CardTitle>{t.sleep.weekly}</CardTitle>
          {week.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{t.sleep.noLogs}</p>
          ) : (
            <dl className="mt-3 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50"><dt className="text-xs text-slate-500">{t.sleep.avgDuration}</dt><dd className="text-xl font-bold">{avgMin ? formatHours(avgMin) : "—"}</dd></div>
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50"><dt className="text-xs text-slate-500">{t.sleep.avgQuality}</dt><dd className="text-xl font-bold">{avgQ}/5</dd></div>
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50"><dt className="text-xs text-slate-500">{t.sleep.nights}</dt><dd className="text-xl font-bold">{week.length}</dd></div>
            </dl>
          )}
          <h3 className="mt-5 text-sm font-semibold">{t.sleep.recent}</h3>
          {logs.length === 0 ? (
            <EmptyState icon={Moon} title={t.common.emptyTitle} />
          ) : (
            <ul className="mt-2 divide-y divide-slate-200 text-sm dark:divide-slate-700">
              {logs.map((l) => (
                <li key={l.id} className="flex items-center justify-between py-2">
                  <span>{formatDate(l.date, locale, { weekday: "short", day: "numeric", month: "short" })}</span>
                  <span className="text-slate-600 dark:text-slate-300">{l.bedtime}–{l.wakeTime} · {formatHours(l.minutes)} · {l.quality}/5</span>
                  <form action={deleteSleepAction}>
                    <input type="hidden" name="id" value={l.id} />
                    <button type="submit" className="rounded p-1 text-slate-400 hover:text-red-600" aria-label={t.common.delete}><Trash2 className="h-4 w-4" aria-hidden /></button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardTitle>{t.sleep.routineTitle}</CardTitle>
          <p className="mb-3 mt-1 text-sm text-slate-600 dark:text-slate-300">{t.sleep.routineHint}</p>
          <BedtimeRoutine initial={routine} labels={{ add: t.sleep.addStep, placeholder: t.sleep.stepPlaceholder, remove: t.common.delete }} />
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>{t.sleep.relaxTitle}</CardTitle>
          <p className="mb-4 mt-1 text-sm text-slate-600 dark:text-slate-300">{t.sleep.relaxText}</p>
          <BoxBreathing labels={{ start: t.sleep.relaxStart, stop: t.sleep.relaxStop, ...t.sleep.phases }} />
        </Card>
        <Card>
          <CardTitle>{t.sleep.eduTitle}</CardTitle>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700 dark:text-slate-300">{t.sleep.edu.map((e) => <li key={e}>{e}</li>)}</ul>
        </Card>
      </div>
    </div>
  );
}
