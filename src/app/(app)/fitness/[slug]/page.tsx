import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Video } from "lucide-react";
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
  const ex = await db.exercise.findUnique({ where: { slug }, select: { name: true } });
  return { title: ex ? tr(ex.name, locale) : "404" };
}

/** Only embed videos from privacy-friendly, allow-listed hosts. */
function safeEmbed(url: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.protocol !== "https:") return null;
    if (["www.youtube-nocookie.com", "player.vimeo.com"].includes(u.hostname)) return u.toString();
  } catch {
    /* invalid */
  }
  return null;
}

export default async function ExercisePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { t, locale } = await getI18n();
  const ex = await db.exercise.findFirst({ where: { slug, published: true } });
  if (!ex) notFound();
  const alternatives = await db.exercise.findMany({ where: { slug: { in: ex.alternatives }, published: true } });
  const levelLabel = { BEGINNER: t.common.beginner, INTERMEDIATE: t.common.intermediate, ADVANCED: t.common.advanced };
  const embed = safeEmbed(ex.videoUrl);
  const name = tr(ex.name, locale);

  return (
    <article className="space-y-6">
      <Link href="/fitness" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:underline dark:text-slate-300"><ArrowLeft className="h-4 w-4" aria-hidden />{t.common.back}</Link>
      <div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="slate">{t.fitness.categories[ex.category as keyof typeof t.fitness.categories] ?? ex.category}</Badge>
          <Badge>{levelLabel[ex.difficulty]}</Badge>
        </div>
        <h1 className="mt-3 text-3xl font-bold">{name}</h1>
        <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">{tr(ex.description, locale)}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {embed ? (
            <div className="aspect-video overflow-hidden rounded-2xl">
              <iframe src={embed} title={name} className="h-full w-full" allow="encrypted-media; picture-in-picture" allowFullScreen loading="lazy" />
            </div>
          ) : (
            <div className="flex aspect-video flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">
              <Video className="mb-2 h-8 w-8" aria-hidden />
              {t.fitness.videoMissing}
            </div>
          )}
          <Card>
            <CardTitle>{t.fitness.steps}</CardTitle>
            <ol className="mt-3 list-decimal space-y-2 pl-5">
              {trList(ex.steps, locale).map((s) => <li key={s}>{s}</li>)}
            </ol>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <dl className="space-y-3 text-sm">
              <div><dt className="text-slate-500">{t.fitness.muscles}</dt><dd className="font-medium">{ex.muscleGroups.map((m) => term(m, locale)).join(", ")}</dd></div>
              <div><dt className="text-slate-500">{t.fitness.equipment}</dt><dd className="font-medium">{ex.equipment === "none" ? t.fitness.noEquipment : ex.equipment}</dd></div>
              <div><dt className="text-slate-500">{t.fitness.duration}</dt><dd className="font-medium">{ex.durationSec}s</dd></div>
            </dl>
          </Card>
          <Alert tone="warning">
            <p className="font-semibold">{t.fitness.safety}</p>
            <ul className="mt-1 list-disc pl-4">{trList(ex.safetyTips, locale).map((s) => <li key={s}>{s}</li>)}</ul>
          </Alert>
          {alternatives.length > 0 && (
            <Card>
              <CardTitle as="h3">{t.fitness.alternatives}</CardTitle>
              <ul className="mt-2 space-y-1 text-sm">
                {alternatives.map((a) => <li key={a.id}><Link href={`/fitness/${a.slug}`} className="text-brand-700 underline dark:text-brand-400">{tr(a.name, locale)}</Link></li>)}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </article>
  );
}
