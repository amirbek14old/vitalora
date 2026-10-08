import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Video } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { getI18n } from "@/lib/i18n/server";
import { tr, trList } from "@/lib/i18n/config";
import { completeLessonAction } from "@/app/actions/academy";
import { Card, CardTitle } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { SubmitButton } from "@/components/submit-button";
import { Quiz } from "@/components/academy/quiz";

export default async function LessonPage({ params }: { params: Promise<{ course: string; lesson: string }> }) {
  const { course: courseSlug, lesson: lessonSlug } = await params;
  const user = await requireUser();
  const { t, locale } = await getI18n();
  const course = await db.course.findFirst({ where: { slug: courseSlug, published: true }, include: { lessons: { orderBy: { order: "asc" }, select: { id: true, slug: true } } } });
  if (!course) notFound();
  const lesson = await db.lesson.findFirst({ where: { courseId: course.id, slug: lessonSlug }, include: { questions: { orderBy: { order: "asc" } } } });
  if (!lesson) notFound();
  const completed = !!(await db.lessonProgress.findUnique({ where: { userId_lessonId: { userId: user.id, lessonId: lesson.id } } }));
  const idx = course.lessons.findIndex((l) => l.id === lesson.id);
  const next = course.lessons[idx + 1];

  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <Link href={`/academy/${course.slug}`} className="inline-flex items-center gap-1 text-sm text-slate-600 hover:underline dark:text-slate-300"><ArrowLeft className="h-4 w-4" aria-hidden />{tr(course.title, locale)}</Link>
      <header>
        <p className="text-sm text-slate-500">{idx + 1}/{course.lessons.length} · {lesson.minutes} {t.common.minutes}</p>
        <h1 className="mt-1 text-3xl font-bold">{tr(lesson.title, locale)}</h1>
      </header>
      {lesson.videoUrl ? (
        <video src={lesson.videoUrl} controls className="w-full rounded-2xl" preload="metadata" />
      ) : (
        <p className="flex items-center gap-2 rounded-xl bg-slate-100 p-3 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300"><Video className="h-4 w-4" aria-hidden />{t.academy.videoMissing}</p>
      )}
      <div className="prose-vitalora text-base">{trList(lesson.body, locale).map((p) => <p key={p}>{p}</p>)}</div>
      <p className="text-xs text-slate-500">{t.common.notMedical}</p>

      {lesson.questions.length > 0 && (
        <Card>
          <CardTitle>{t.academy.quiz}</CardTitle>
          <div className="mt-4">
            <Quiz lessonId={lesson.id} questions={lesson.questions.map((q) => ({ id: q.id, prompt: tr(q.prompt, locale), options: trList(q.options, locale) }))} labels={{ check: t.academy.checkAnswers, score: t.academy.score, error: t.common.errorGeneric }} />
          </div>
        </Card>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {completed ? (
          <span className="inline-flex items-center gap-2 font-medium text-brand-700 dark:text-brand-400"><CheckCircle2 className="h-5 w-5" aria-hidden />{t.academy.completed}</span>
        ) : (
          <form action={completeLessonAction}>
            <input type="hidden" name="lessonId" value={lesson.id} />
            <SubmitButton pendingText={t.common.saving}>{t.academy.completeLesson}</SubmitButton>
          </form>
        )}
        {next ? (
          <ButtonLink href={`/academy/${course.slug}/${next.slug}`} variant="outline">{t.academy.nextLesson}</ButtonLink>
        ) : (
          <ButtonLink href={`/academy/${course.slug}`} variant="outline">{t.academy.certificate}</ButtonLink>
        )}
      </div>
    </article>
  );
}
