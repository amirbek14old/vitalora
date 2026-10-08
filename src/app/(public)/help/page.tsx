import { getI18n } from "@/lib/i18n/server";
import { PageHeader } from "@/components/page-header";
import { Alert } from "@/components/ui/alert";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.help.title };
}

export default async function HelpPage() {
  const { t } = await getI18n();
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <PageHeader title={t.help.title} />
      <div className="space-y-3">
        {t.help.faq.map((f) => (
          <details key={f.q} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-surface-carddark">
            <summary className="cursor-pointer font-medium text-slate-900 dark:text-white">{f.q}</summary>
            <p className="mt-2 text-slate-700 dark:text-slate-300">{f.a}</p>
          </details>
        ))}
      </div>
      <h2 className="mt-10 text-xl font-semibold">{t.help.contactTitle}</h2>
      <Alert tone="warning" className="mt-3">{t.help.contact}</Alert>
    </div>
  );
}
