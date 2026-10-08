import { ShieldCheck } from "lucide-react";
import { getI18n } from "@/lib/i18n/server";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.about.title };
}

export default async function AboutPage() {
  const { t } = await getI18n();
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <PageHeader title={t.about.title} subtitle={t.common.slogan} />
      <p className="text-lg text-slate-700 dark:text-slate-300">{t.about.mission}</p>
      <h2 className="mt-10 text-xl font-semibold">{t.about.whyTitle}</h2>
      <p className="mt-2 text-slate-700 dark:text-slate-300">{t.about.why}</p>
      <Card className="mt-10">
        <h2 className="flex items-center gap-2 text-xl font-semibold"><ShieldCheck className="h-5 w-5 text-brand-700" aria-hidden />{t.about.safetyTitle}</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-700 dark:text-slate-300">
          {t.about.safety.map((s) => <li key={s}>{s}</li>)}
        </ul>
      </Card>
    </div>
  );
}
