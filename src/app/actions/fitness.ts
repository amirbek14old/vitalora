"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { assertUser } from "@/lib/auth/guards";
import { workoutSchema } from "@/lib/validation";
import { evaluateAchievements } from "@/lib/achievements";
import { getI18n } from "@/lib/i18n/server";
import { fmt } from "@/lib/i18n/config";
import { awardCoins } from "@/lib/coins";
import type { ActionState } from "@/lib/action-state";

export async function logWorkoutAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await assertUser();
  const { t } = await getI18n();
  const parsed = workoutSchema.safeParse({
    title: formData.get("title"),
    durationMin: formData.get("durationMin"),
    effort: formData.get("effort"),
    notes: formData.get("notes") ?? "",
    exerciseSlugs: formData.getAll("exerciseSlugs"),
  });
  if (!parsed.success) return { error: t.common.errorGeneric };
  const { exerciseSlugs, ...data } = parsed.data;

  const exercises = exerciseSlugs.length
    ? await db.exercise.findMany({ where: { slug: { in: exerciseSlugs }, published: true }, select: { id: true, durationSec: true } })
    : [];

  const session = await db.workoutSession.create({
    data: {
      ...data,
      notes: data.notes || null,
      userId: user.id,
      logs: { create: exercises.map((e) => ({ exerciseId: e.id, durationSec: e.durationSec })) },
    },
  });
  const coins = await awardCoins(user.id, "workout", `workout:${session.id}`);
  await evaluateAchievements(user.id, ["first_workout", "ten_workouts"]);
  revalidatePath("/fitness/history");
  revalidatePath("/dashboard");
  return { ok: true, message: coins ? `${t.fitness.logged} ${fmt(t.coins.earned, { n: coins })}` : t.fitness.logged };
}

export async function deleteWorkoutAction(formData: FormData) {
  const user = await assertUser();
  const id = String(formData.get("id") ?? "");
  // Ownership check is part of the WHERE clause.
  await db.workoutSession.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/fitness/history");
  revalidatePath("/dashboard");
}
