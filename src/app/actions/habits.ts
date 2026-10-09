"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { assertUser } from "@/lib/auth/guards";
import { habitSchema } from "@/lib/validation";
import { startOfDayUTC } from "@/lib/utils";
import { evaluateAchievements } from "@/lib/achievements";
import { awardCoins } from "@/lib/coins";
import { getI18n } from "@/lib/i18n/server";
import type { ActionState } from "@/lib/action-state";

function refresh() {
  revalidatePath("/habits");
  revalidatePath("/dashboard");
}

export async function createHabitAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await assertUser();
  const { t } = await getI18n();
  const parsed = habitSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: t.common.errorGeneric };
  const count = await db.habit.count({ where: { userId: user.id, archived: false } });
  if (count >= 20) return { error: t.common.errorGeneric };
  await db.habit.create({ data: { ...parsed.data, userId: user.id } });
  await evaluateAchievements(user.id, ["first_habit"]);
  refresh();
  return { ok: true, message: t.settings.saved };
}

/** Toggle completion for a given day (only today or the past 6 days can be changed). */
export async function toggleHabitAction(formData: FormData) {
  const user = await assertUser();
  const habitId = String(formData.get("habitId") ?? "");
  const dateStr = String(formData.get("date") ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return;
  const date = new Date(`${dateStr}T00:00:00.000Z`);
  const today = startOfDayUTC(new Date());
  const diffDays = (today.getTime() - date.getTime()) / 86_400_000;
  if (diffDays < 0 || diffDays > 6) return;

  const habit = await db.habit.findFirst({ where: { id: habitId, userId: user.id, archived: false } });
  if (!habit) return;
  const existing = await db.habitEntry.findUnique({ where: { habitId_date: { habitId, date } } });
  if (existing) await db.habitEntry.delete({ where: { id: existing.id } });
  else {
    await db.habitEntry.create({ data: { habitId, date } });
    // Rewarded once per habit per day — un-ticking and re-ticking doesn't pay twice.
    await awardCoins(user.id, "habit", `habit:${habitId}:${dateStr}`);
  }
  await evaluateAchievements(user.id, ["habit_25"]);
  refresh();
}

export async function setHabitPausedAction(formData: FormData) {
  const user = await assertUser();
  await db.habit.updateMany({
    where: { id: String(formData.get("habitId") ?? ""), userId: user.id },
    data: { paused: formData.get("paused") === "true" },
  });
  refresh();
}

export async function deleteHabitAction(formData: FormData) {
  const user = await assertUser();
  await db.habit.deleteMany({ where: { id: String(formData.get("habitId") ?? ""), userId: user.id } });
  refresh();
}
