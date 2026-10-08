import Link from "next/link";
import { Clock, ShieldCheck } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { getI18n } from "@/lib/i18n/server";
import { tr } from "@/lib/i18n/config";
import { buildRoutine, type Focus, type Level } from "@/lib/routine";
import { routineSchema } from "@/lib/validation";
import { PageHeader } from "@/components/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Select } from "@/components/ui/form";
import { LogWorkoutForm } from "@/components/fitness/log-workout-form";
import { cn } from "@/lib/utils";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.fitness.title };
}

const CATEGORIES = ["warmup", "strength", "cardio", "mobility", "balance", "cooldown"] as const;

export default async function FitnessPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await requireUser();
  const { t, locale } = await getI18n();
  const sp = await searchParams;
  const category = CATEGORIES.find((c) => c === sp.category);

  const exercises = await db.exercise.findMany({ where: { published: true }, orderBy: [{ difficulty: "asc" }, { slug: "asc" }] });
  const visible = category ? exercises.filter((e) => e.category === category) : exercises;
  const levelLabel = { BEGINNER: t.common.beginner, INTERMEDIATE: t.common.intermediate, ADVANCED: t.common.advanced };

  const routineInput = routineSchema.safeParse({ minutes: sp.minutes, level: sp.level, focus: sp.focus });
  const defaults = {
    minutes: routineInput.success ? routineInput.data.minutes : user.profile?.minutesPerDay && [10, 15, 20, 30, 45].includes(user.profile.minutesPerDay) ? user.profile.minutesPerDay : 15,
    level: (routineInput.success ? routineInput.data.level : user.profile?.experienceLevel ?? "BEGINNER") as Level,
    focus: (routineInput.success ? routineInput.data.focus : "full") as Focus,
  };
  const routine = routineInput.success ? buildRoutine(exercises, { ...routineInput.data, seed: new Date().getUTCDate() }) : null;
  const byId = new Map(exercises.map((e) => [e.slug, e]));
  const routineSlugs = routine ? [...routine.warmup, ...routine.main, ...routine.cooldown].map((e) => e.slug) : [];

  return (
    <div className="space-y-8">
      <PageHeader title={t.fitness.title} subtitle={t.fitness.subtitle} />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardTitle>{t.fitness.builderTitle}</CardTitle>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t.fitness.builderText}</p>
          <form method="get" className="mt-4 grid gap-3 sm:grid-cols-4 sm:items-end">
            <Field label={t.fitness.availableTime} htmlFor="minutes">
              <Select id="minutes" name="minutes" defaultValue={String(defaults.minutes)}>
                {[10, 15, 20, 30, 45].map((m) => <option key={m} value={m}>{m} {t.common.minutes}</option>)}
              </Select>
            </Field>
            <Field label={t.fitness.level} htmlFor="level">
              <Select id="level" name="level" defaultValue={defaults.level}>
                {(["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const).map((l) => <option key={l} value={l}>{levelLabel[l]}</option>)}
              </Select>
            </Field>
            <Field label={t.fitness.focus} htmlFor="focus">
              <Select id="focus" name="focus" defaultValue={defaults.focus}>
                {Object.entries(t.fitness.focusOptions).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </Select>
            </Field>
            <Button type="submit">{t.fitness.build}</Button>
          </form>

          {routine && (
            <div className="mt-6 rounded-xl border border-brand-200 bg-brand-50/50 p-4 dark:border-brand-900 dark:bg-brand-900/20" aria-live="polite">
              <h3 className="font-semibold">{t.fitness.yourRoutine} · ~{routine.totalMinutes} {t.common.minutes}</h3>
              <ol className="mt-3 space-y-3 text-sm">
                <RoutineBlock title={t.fitness.categories.warmup} items={routine.warmup.map((e) => byId.get(e.slug)!)} locale={locale} suffix={`~1 ${t.common.minutes}`} />
                <RoutineBlock
                  title={`${t.fitness.categories.strength} / ${t.fitness.categories.cardio} — ${routine.rounds} ${t.fitness.rounds}`}
                  items={routine.main.map((e) => byId.get(e.slug)!)}
                  locale={locale}
                  suffix={`${routine.workSec}s / ${routine.restSec}s`}
                />
                <RoutineBlock title={t.fitness.categories.cooldown} items={routine.cooldown.map((e) => byId.get(e.slug)!)} locale={locale} suffix={`~1 ${t.common.minutes}`} />
              </ol>
              <div className="mt-5 border-t border-brand-200 pt-4 dark:border-brand-900">
                <h4 className="text-sm font-semibold text-brand-800 dark:text-brand-300">{t.fitness.logRoutine}</h4>
                <div className="mt-3">
                  <LogWorkoutForm
                    compact
                    exerciseSlugs={routineSlugs}
                    defaults={{ title: `${t.fitness.focusOptions[defaults.focus]} · ${routine.totalMinutes} ${t.common.minutes}`, durationMin: routine.totalMinutes }}
                    labels={{ title: t.fitness.sessionTitle, duration: t.fitness.durationMin, effort: t.fitness.effort, notes: t.fitness.notes, submit: t.common.save, saving: t.common.saving }}
                  />
                </div>
              </div>
            </div>
          )}
        </Card>

        <Card>
          <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-brand-700" aria-hidden />{t.fitness.progressionTitle}</CardTitle>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700 dark:text-slate-300">
            {t.fitness.progression.map((p) => <li key={p}>{p}</li>)}
          </ul>
          <p className="mt-4 text-xs text-slate-500">{t.common.notMedical}</p>
        </Card>
      </div>

      <section aria-labelledby="library">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 id="library" className="text-xl font-semibold">{t.fitness.library}</h2>
          <nav aria-label={t.fitness.library} className="flex flex-wrap gap-2">
            <FilterLink href="/fitness" active={!category}>{t.fitness.filterAll}</FilterLink>
            {CATEGORIES.map((c) => <FilterLink key={c} href={`/fitness?category=${c}`} active={category === c}>{t.fitness.categories[c]}</FilterLink>)}
          </nav>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((e) => (
            <Link key={e.id} href={`/fitness/${e.slug}`} className="group">
              <Card className="h-full transition-shadow group-hover:shadow-md">
                <div className="flex items-center justify-between gap-2">
                  <Badge tone="slate">{t.fitness.categories[e.category as keyof typeof t.fitness.categories] ?? e.category}</Badge>
                  <Badge>{levelLabel[e.difficulty]}</Badge>
                </div>
                <h3 className="mt-3 font-semibold group-hover:text-brand-700 dark:group-hover:text-brand-400">{tr(e.name, locale)}</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{tr(e.description, locale)}</p>
                <p className="mt-3 flex items-center gap-1 text-xs text-slate-500"><Clock className="h-3.5 w-3.5" aria-hidden />{e.durationSec}s</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function FilterLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} aria-current={active ? "page" : undefined} className={cn("rounded-full px-3 py-1.5 text-sm", active ? "bg-brand-700 text-white dark:bg-brand-500 dark:text-slate-950" : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200")}>
      {children}
    </Link>
  );
}

function RoutineBlock({ title, items, locale, suffix }: { title: string; items: { slug: string; name: unknown }[]; locale: "uz" | "en" | "ru"; suffix: string }) {
  if (!items.length) return null;
  return (
    <li>
      <p className="font-medium">{title}</p>
      <ul className="mt-1 space-y-1 pl-4">
        {items.map((e) => (
          <li key={e.slug} className="flex justify-between gap-2">
            <Link href={`/fitness/${e.slug}`} className="underline decoration-dotted">{tr(e.name, locale)}</Link>
            <span className="text-slate-500">{suffix}</span>
          </li>
        ))}
      </ul>
    </li>
  );
}
