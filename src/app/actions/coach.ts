"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { assertUser } from "@/lib/auth/guards";
import { formSessionSchema } from "@/lib/validation";
import { awardCoins } from "@/lib/coins";
import { FORM_COINS_PER_SESSION } from "@/lib/coin-rules";
import { evaluateAchievements } from "@/lib/achievements";
import { getI18n } from "@/lib/i18n/server";

export type SaveFormResult = { ok: true; coins: number } | { ok: false };

/** Saves the numbers from an on-device camera session (no video or images are sent). */
export async function saveFormSessionAction(input: unknown): Promise<SaveFormResult> {
  const user = await assertUser();
  const parsed = formSessionSchema.safeParse(input);
  if (!parsed.success || parsed.data.reps === 0) return { ok: false };
  const d = parsed.data;
  const { t } = await getI18n();

  const session = await db.formCheckSession.create({ data: { ...d, userId: user.id } });
  // Also appears in workout history. Coins come from good reps, not from the workout entry.
  await db.workoutSession.create({
    data: {
      userId: user.id,
      title: `${d.exercise === "pushup" ? t.coach.pushup : t.coach.squat} × ${d.reps} (${t.coach.title})`,
      durationMin: Math.max(1, Math.round(d.durationSec / 60)),
      effort: 3,
      notes: `${t.coach.goodReps}: ${d.goodReps}/${d.reps}, ${t.coach.avgScore}: ${d.avgScore}`,
    },
  });
  const coins = await awardCoins(user.id, "form_check", `form:${session.id}`, Math.min(d.goodReps, FORM_COINS_PER_SESSION));
  await evaluateAchievements(user.id, ["first_workout", "ten_workouts"]);
  revalidatePath("/", "layout");
  return { ok: true, coins };
}
