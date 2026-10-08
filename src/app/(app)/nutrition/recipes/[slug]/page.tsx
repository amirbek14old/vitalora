import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { getI18n } from "@/lib/i18n/server";
import { tr, trList } from "@/lib/i18n/config";
import { term } from "@/lib/i18n/terms";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { locale } = await getI18n();
  const r = await db.recipe.findUnique({ where: { slug }, select: { title: true } });
  return { title: r ? tr(r.title, locale) : "404" };
}

export default async function RecipePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { t, locale } = await getI18n();
  const r = await db.recipe.findFirst({ where: { slug, published: true } });
  if (!r) notFound();

  return (
    <article className="space-y-6">
      <Link href="/nutrition/recipes" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:underline dark:text-slate-300"><ArrowLeft className="h-4 w-4" aria-hidden />{t.common.back}</Link>
      <div>
        <Badge>{r.cuisine === "uzbek" ? t.recipes.uzbek : t.recipes.international}</Badge>
        <h1 className="mt-3 text-3xl font-bold">{tr(r.title, locale)}</h1>
        <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">{tr(r.description, locale)}</p>
        <p className="mt-2 text-sm text-slate-500">{t.recipes.prep}: {r.prepMin} {t.common.minutes} · {t.recipes.servings}: {r.servings}</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4">
          <Card>
            <CardTitle>{t.recipes.ingredients}</CardTitle>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">{trList(r.ingredients, locale).map((i) => <li key={i}>{i}</li>)}</ul>
          </Card>
          <Card>
            <CardTitle as="h3" className="text-base">{t.recipes.foodGroups}</CardTitle>
            <div className="mt-2 flex flex-wrap gap-2">{r.foodGroups.map((g) => <Badge key={g} tone="slate">{term(g, locale)}</Badge>)}</div>
          </Card>
          <Alert tone={r.allergens.length ? "warning" : "info"}>
            {r.allergens.length ? `${t.recipes.allergens}: ${r.allergens.map((a) => term(a, locale)).join(", ")}` : t.recipes.noAllergens}
          </Alert>
        </div>
        <Card className="lg:col-span-2">
          <CardTitle>{t.recipes.steps}</CardTitle>
          <ol className="mt-3 list-decimal space-y-3 pl-5">{trList(r.steps, locale).map((s) => <li key={s}>{s}</li>)}</ol>
        </Card>
      </div>
    </article>
  );
}
