import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Award, CheckCircle2, Circle } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { getI18n } from "@/lib/i18n/server";
import { fmt, tr } from "@/lib/i18n/config";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default async function CoursePage({ params }: { params: Promise<{ course: string }> }) {
  const { course: slug } = await params;
  const user = await requireUser();
  const { t, locale } = await getI18n();
  const course = await db.course.findFirst({ where: { slug, published: true }, include: { lessons: { orderBy: { order: "asc" } } } });
  if (!course) notFound();
  const progress = await db.lessonProgress.findMany({ where: { userId: user.id, lessonId: { in: course.lessons.map((l) => l.id) } }, select: { lessonId: true } });
  const done = new Set(progress.map((p) => p.lessonId));
  const allDone = course.lessons.length > 0 && done.size === course.lessons.length;
  const next = course.lessons.find((l) => !done.has(l.id)) ?? course.lessons[0];

  return (
    <div className="space-y-6">
      <Link href="/academy" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:underline dark:text-slate-300"><ArrowLeft className="h-4 w-4" aria-hidden />{t.common.back}</Link>
      <PageHeader title={tr(course.title, locale)} subtitle={tr(course.description, locale)} actions={next && !allDone ? <ButtonLink href={`/academy/${course.slug}/${next.slug}`}>{done.size ? t.academy.continue : t.academy.startCourse}</ButtonLink> : undefined} />
      <Progress value={done.size} max={course.lessons.length} label={tr(course.title, locale)} />
      <p className="text-sm text-slate-500">{fmt(t.academy.progress, { done: done.size, total: course.lessons.length })}</p>
      <ol className="space-y-3">
        {course.lessons.map((l, i) => (
          <li key={l.id}>
            <Link href={`/academy/${course.slug}/${l.slug}`}>
              <Card className="flex items-center gap-4 hover:shadow-md">
                {done.has(l.id) ? <CheckCircle2 className="h-6 w-6 text-brand-600" aria-label={t.academy.completed} /> : <Circle className="h-6 w-6 text-slate-300" aria-hidden />}
                <div className="flex-1">
                  <p className="font-medium">{i + 1}. {tr(l.title, locale)}</p>
                  <p className="text-xs text-slate-500">{l.minutes} {t.common.minutes}</p>
                </div>
              </Card>
            </Link>
          </li>
        ))}
      </ol>
      <Card className="flex items-center gap-4">
        <Award className="h-8 w-8 text-amber-500" aria-hidden />
        <div className="flex-1">
          <p className="font-semibold">{t.academy.certificate}</p>
          {!allDone && <p className="text-sm text-slate-500">{t.academy.locked}</p>}
        </div>
        {allDone && <ButtonLink href={`/academy/${course.slug}/certificate`} variant="secondary">{t.academy.viewCertificate}</ButtonLink>}
      </Card>
    </div>
  );
}
