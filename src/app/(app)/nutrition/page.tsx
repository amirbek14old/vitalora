import Link from "next/link";
import { Camera, Droplets, ShieldAlert, Utensils } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { getI18n } from "@/lib/i18n/server";
import { tr, trList } from "@/lib/i18n/config";
import { PageHeader } from "@/components/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { Quiz } from "@/components/academy/quiz";
import { AIRecipe } from "@/components/nutrition/ai-recipe";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.nutrition.title };
}

export default async function NutritionPage() {
  const user = await requireUser();
  const { t, locale } = await getI18n();
  const [lessons, recipes, quizLessons] = await Promise.all([
    db.nutritionLesson.findMany({ where: { published: true }, orderBy: { order: "asc" } }),
    db.recipe.findMany({ where: { published: true }, orderBy: { cuisine: "desc" }, take: 4 }),
    db.lesson.findMany({
      where: { course: { slug: "nutrition-fundamentals", published: true } },
      orderBy: { order: "asc" },
      include: { questions: { orderBy: { order: "asc" } } },
    }),
  ]);
  const quizQuestions = quizLessons.filter((l) => l.questions.length);

  return (
    <div className="space-y-8">
      <PageHeader title={t.nutrition.title} subtitle={t.nutrition.subtitle} actions={<ButtonLink href="/nutrition/scan" variant="secondary"><Camera className="h-4 w-4" aria-hidden />{t.nutrition.foodScanCta}</ButtonLink>} />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardTitle className="flex items-center gap-2"><Utensils className="h-5 w-5 text-brand-700" aria-hidden />{t.nutrition.plateTitle}</CardTitle>
          <PlateDiagram labels={t.nutrition.plate} />
        </Card>
        <Card>
          <CardTitle className="flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-amber-600" aria-hidden />{t.nutrition.allergyTitle}</CardTitle>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{t.nutrition.allergyText}</p>
        </Card>
        <Card>
          <CardTitle>{t.nutrition.aiRecipe}</CardTitle>
          <p className="mb-3 mt-1 text-sm text-slate-600 dark:text-slate-300">{t.nutrition.aiRecipeHint}</p>
          {user.preference?.aiConsent ? (
            <AIRecipe labels={{ label: t.nutrition.aiRecipe, placeholder: t.nutrition.aiRecipePlaceholder, ask: t.nutrition.ask, loading: t.assistant.thinking, error: t.common.errorGeneric, notConfigured: t.assistant.notConfigured, rateLimited: t.assistant.rateLimited, disclaimer: t.common.notMedical, open: t.assistant.history }} />
          ) : (
            <p className="text-sm">{t.assistant.consentText} <Link href="/settings" className="underline">{t.assistant.goSettings}</Link></p>
          )}
        </Card>
      </div>

      <section aria-labelledby="n-lessons">
        <h2 id="n-lessons" className="mb-4 text-xl font-semibold">{t.nutrition.lessons}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {lessons.map((l) => (
            <Card key={l.id}>
              <CardTitle as="h3" className="flex items-center gap-2">{l.topic === "hydration" && <Droplets className="h-4 w-4 text-sky-600" aria-hidden />}{tr(l.title, locale)}</CardTitle>
              <div className="prose-vitalora mt-2 text-sm">{trList(l.body, locale).map((p) => <p key={p}>{p}</p>)}</div>
              {l.sources.length > 0 && (
                <p className="text-xs text-slate-500">{t.nutrition.sources}: {l.sources.map((s) => <a key={s} href={s} target="_blank" rel="noopener noreferrer" className="underline">{new URL(s).hostname}</a>)}</p>
              )}
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="n-recipes">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="n-recipes" className="text-xl font-semibold">{t.nutrition.recipes}</h2>
          <Link href="/nutrition/recipes" className="text-sm text-brand-700 underline dark:text-brand-400">{t.common.seeAll}</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {recipes.map((r) => (
            <Link key={r.id} href={`/nutrition/recipes/${r.slug}`}>
              <Card className="h-full hover:shadow-md">
                <p className="text-xs uppercase tracking-wide text-brand-700 dark:text-brand-400">{r.cuisine === "uzbek" ? t.recipes.uzbek : t.recipes.international}</p>
                <h3 className="mt-1 font-semibold">{tr(r.title, locale)}</h3>
                <p className="mt-1 text-xs text-slate-500">{r.prepMin} {t.common.minutes}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {quizQuestions.length > 0 && (
        <section aria-labelledby="n-quiz">
          <h2 id="n-quiz" className="mb-4 text-xl font-semibold">{t.nutrition.quiz}</h2>
          <div className="grid gap-4 lg:grid-cols-3">
            {quizQuestions.map((l) => (
              <Card key={l.id}>
                <CardTitle as="h3" className="mb-3 text-base">{tr(l.title, locale)}</CardTitle>
                <Quiz
                  lessonId={l.id}
                  questions={l.questions.map((q) => ({ id: q.id, prompt: tr(q.prompt, locale), options: trList(q.options, locale) }))}
                  labels={{ check: t.academy.checkAnswers, score: t.academy.score, error: t.common.errorGeneric }}
                />
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function PlateDiagram({ labels }: { labels: string[] }) {
  return (
    <div className="mt-3 flex items-center gap-4">
      <svg viewBox="0 0 100 100" className="h-28 w-28 shrink-0" role="img" aria-label={labels.slice(0, 3).join("; ")}>
        <circle cx="50" cy="50" r="48" fill="#E2E8F0" />
        <path d="M50 50 L50 4 A46 46 0 0 0 50 96 Z" fill="#22C55E" />
        <path d="M50 50 L50 4 A46 46 0 0 1 96 50 Z" fill="#F59E0B" />
        <path d="M50 50 L96 50 A46 46 0 0 1 50 96 Z" fill="#14B8A6" />
      </svg>
      <ul className="space-y-1 text-sm">
        <li className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-green-500" aria-hidden />{labels[0]}</li>
        <li className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-amber-500" aria-hidden />{labels[1]}</li>
        <li className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-teal-500" aria-hidden />{labels[2]}</li>
        <li className="flex items-center gap-2"><Droplets className="h-3 w-3 text-sky-500" aria-hidden />{labels[3]}</li>
      </ul>
    </div>
  );
}
