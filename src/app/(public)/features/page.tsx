import { getI18n } from "@/lib/i18n/server";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.features.title };
}

export default async function FeaturesPage() {
  const { t } = await getI18n();
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <PageHeader title={t.features.title} subtitle={t.features.subtitle} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {t.features.items.map((f) => (
          <Card key={f.title}>
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-semibold text-slate-900 dark:text-white">{f.title}</h2>
              <Badge tone={f.status === "available" ? "brand" : "amber"}>{f.status === "available" ? t.features.available : t.features.planned}</Badge>
            </div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{f.text}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
