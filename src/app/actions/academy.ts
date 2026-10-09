"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { assertUser } from "@/lib/auth/guards";
import { evaluateAchievements } from "@/lib/achievements";
import { awardCoins } from "@/lib/coins";
import { getLocale } from "@/lib/i18n/server";
import { tr } from "@/lib/i18n/config";

export async function completeLessonAction(formData: FormData) {
  const user = await assertUser();
  const lessonId = String(formData.get("lessonId") ?? "");
  const lesson = await db.lesson.findFirst({ where: { id: lessonId, course: { published: true } }, include: { course: true } });
  if (!lesson) return;
  await db.lessonProgress.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId } },
    update: {},
    create: { userId: user.id, lessonId },
  });
  await awardCoins(user.id, "lesson", `lesson:${lessonId}`);
  await evaluateAchievements(user.id, ["first_lesson", "first_course"]);
  revalidatePath("/", "layout");
  revalidatePath(`/academy/${lesson.course.slug}`);
  revalidatePath("/academy");
  revalidatePath("/dashboard");
}

const quizSchema = z.object({ lessonId: z.string().cuid(), answers: z.array(z.number().int().min(-1).max(10)).max(20) });

export type QuizResult = { score: number; total: number; correct: number[]; explanations: string[] } | { error: true };

/** Answers are graded on the server; correct answers are only revealed after submission. */
export async function submitQuizAction(input: { lessonId: string; answers: number[] }): Promise<QuizResult> {
  const user = await assertUser();
  const parsed = quizSchema.safeParse(input);
  if (!parsed.success) return { error: true };
  const questions = await db.quizQuestion.findMany({ where: { lessonId: parsed.data.lessonId }, orderBy: { order: "asc" } });
  if (!questions.length) return { error: true };
  const correct = questions.map((q) => q.correctIndex);
  const score = questions.reduce((acc, q, i) => acc + (parsed.data.answers[i] === q.correctIndex ? 1 : 0), 0);
  await db.quizAttempt.create({ data: { userId: user.id, lessonId: parsed.data.lessonId, score, total: questions.length } });
  if (score === questions.length) await awardCoins(user.id, "quiz_perfect", `quiz:${parsed.data.lessonId}`);
  await evaluateAchievements(user.id, ["quiz_perfect"]);
  const locale = await getLocale();
  return { score, total: questions.length, correct, explanations: questions.map((q) => tr(q.explanation, locale)) };
}
