import { Lightbulb } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { getI18n } from "@/lib/i18n/server";
import { fmt } from "@/lib/i18n/config";
import { formatDate } from "@/lib/i18n/format";
import { PageHeader } from "@/components/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { PoseCoach } from "@/components/coach/pose-coach";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.coach.title };
}

const speech = { uz: "uz-UZ", en: "en-US", ru: "ru-RU" } as const;

export default async function CoachPage() {
  const user = await requireUser();
  const { t, locale } = await getI18n();
  const sessions = await db.formCheckSession.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 8 });

  return (
    <div className="space-y-6">
      <PageHeader title={t.coach.title} subtitle={t.coach.subtitle} />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <PoseCoach
            aiEnabled={false}
            speechLang={speech[locale]}
            labels={{ ...t.coach, errorGeneric: t.common.errorGeneric, coinsEarned: t.coins.earned, notConfigured: t.assistant.notConfigured, rateLimited: t.assistant.rateLimited }}
          />
        </Card>
        <div className="space-y-4">
          <Alert tone="success">
            {t.coach.privacy}
          </Alert>
          <Card>
            <CardTitle className="flex items-center gap-2"><Lightbulb className="h-5 w-5 text-amber-500" aria-hidden />{t.coach.tipsTitle}</CardTitle>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-700 dark:text-slate-300">{t.coach.tips.map((tip) => <li key={tip}>{tip}</li>)}</ol>
          </Card>
          <Card>
            <CardTitle>{t.coach.history}</CardTitle>
            {sessions.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">{t.coach.historyEmpty}</p>
            ) : (
              <ul className="mt-3 divide-y divide-slate-200 text-sm dark:divide-slate-700">
                {sessions.map((s) => (
                  <li key={s.id} className="flex justify-between py-2">
                    <span>{s.exercise === "pushup" ? t.coach.pushup : t.coach.squat} · {formatDate(s.createdAt, locale, { day: "numeric", month: "short" })}</span>
                    <span className="text-slate-500">{fmt(t.coach.sessionLine, { good: s.goodReps, reps: s.reps, score: s.avgScore })}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <p className="text-xs text-slate-500">{t.coach.disclaimer}</p>
        </div>
      </div>
    </div>
  );
}
