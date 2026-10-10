import Link from "next/link";
import { Clock, Users } from "lucide-react";
import { db } from "@/lib/db";
import { getI18n } from "@/lib/i18n/server";
import { tr } from "@/lib/i18n/config";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.recipes.title };
}

export default async function RecipesPage() {
  const { t, locale } = await getI18n();
  const recipes = await db.recipe.findMany({ where: { published: true }, orderBy: [{ prepMin: "asc" }] });

  return (
    <div className="space-y-6">
      <PageHeader title={t.recipes.title} subtitle={t.nutrition.allergyText} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recipes.map((r) => (
          <Link key={r.id} href={`/nutrition/recipes/${r.slug}`} className="group">
            <Card className="h-full group-hover:shadow-md">
              <h2 className="font-semibold group-hover:text-brand-700">{tr(r.title, locale)}</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{tr(r.description, locale)}</p>
              <div className="mt-3 flex gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" aria-hidden />{r.prepMin} {t.common.minutes}</span>
                <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" aria-hidden />{r.servings}</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
