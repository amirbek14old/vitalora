import Link from "next/link";
import { Clock, Users } from "lucide-react";
import { db } from "@/lib/db";
import { getI18n } from "@/lib/i18n/server";
import { tr } from "@/lib/i18n/config";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.recipes.title };
}

export default async function RecipesPage({ searchParams }: { searchParams: Promise<{ cuisine?: string }> }) {
  const { t, locale } = await getI18n();
  const { cuisine } = await searchParams;
  const filter = cuisine === "uzbek" || cuisine === "international" ? cuisine : undefined;
  const recipes = await db.recipe.findMany({ where: { published: true, ...(filter ? { cuisine: filter } : {}) }, orderBy: [{ cuisine: "desc" }, { prepMin: "asc" }] });

  const tabs = [
    { href: "/nutrition/recipes", label: t.recipes.filterAll, active: !filter },
    { href: "/nutrition/recipes?cuisine=uzbek", label: t.recipes.uzbek, active: filter === "uzbek" },
    { href: "/nutrition/recipes?cuisine=international", label: t.recipes.international, active: filter === "international" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title={t.recipes.title} subtitle={t.nutrition.allergyText} />
      <nav className="flex flex-wrap gap-2" aria-label={t.recipes.title}>
        {tabs.map((tab) => (
          <Link key={tab.href} href={tab.href} aria-current={tab.active ? "page" : undefined} className={cn("rounded-full px-3 py-1.5 text-sm", tab.active ? "bg-brand-700 text-white dark:bg-brand-500 dark:text-slate-950" : "bg-slate-100 dark:bg-slate-800")}>{tab.label}</Link>
        ))}
      </nav>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recipes.map((r) => (
          <Link key={r.id} href={`/nutrition/recipes/${r.slug}`} className="group">
            <Card className="h-full group-hover:shadow-md">
              <Badge tone={r.cuisine === "uzbek" ? "brand" : "slate"}>{r.cuisine === "uzbek" ? t.recipes.uzbek : t.recipes.international}</Badge>
              <h2 className="mt-3 font-semibold group-hover:text-brand-700">{tr(r.title, locale)}</h2>
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
