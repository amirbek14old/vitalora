"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { assertUser } from "@/lib/auth/guards";
import { sleepLogSchema } from "@/lib/validation";
import { sleepMinutes } from "@/lib/utils";
import { evaluateAchievements } from "@/lib/achievements";
import { getI18n } from "@/lib/i18n/server";
import type { ActionState } from "@/lib/action-state";

export async function logSleepAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await assertUser();
  const { t } = await getI18n();
  const parsed = sleepLogSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: t.common.errorGeneric };
  const { date, bedtime, wakeTime, quality, notes } = parsed.data;
  const day = new Date(`${date}T00:00:00.000Z`);
  if (day.getTime() > Date.now() + 24 * 3600 * 1000) return { error: t.common.errorGeneric };
  const minutes = sleepMinutes(bedtime, wakeTime);
  const data = { bedtime, wakeTime, minutes, quality, notes: notes || null };
  await db.sleepLog.upsert({
    where: { userId_date: { userId: user.id, date: day } },
    update: data,
    create: { ...data, userId: user.id, date: day },
  });
  await evaluateAchievements(user.id, ["first_sleep_log", "sleep_week"]);
  revalidatePath("/sleep");
  revalidatePath("/dashboard");
  return { ok: true, message: t.sleep.saved };
}

const routineSchema = z.array(z.object({ id: z.string().max(40), label: z.string().trim().min(1).max(80), done: z.boolean() })).max(15);

export async function saveBedtimeRoutineAction(items: unknown): Promise<{ ok: boolean }> {
  const user = await assertUser();
  const parsed = routineSchema.safeParse(items);
  if (!parsed.success) return { ok: false };
  await db.preference.upsert({
    where: { userId: user.id },
    update: { bedtimeRoutine: parsed.data },
    create: { userId: user.id, bedtimeRoutine: parsed.data },
  });
  return { ok: true };
}

export async function deleteSleepAction(formData: FormData) {
  const user = await assertUser();
  await db.sleepLog.deleteMany({ where: { id: String(formData.get("id") ?? ""), userId: user.id } });
  revalidatePath("/sleep");
}
