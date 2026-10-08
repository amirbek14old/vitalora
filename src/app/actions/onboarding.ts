"use server";
import { redirect } from "next/navigation";
import type { HabitCategory } from "@prisma/client";
import { db } from "@/lib/db";
import { assertUser } from "@/lib/auth/guards";
import { onboardingSchema } from "@/lib/validation";
import { getI18n } from "@/lib/i18n/server";
import type { ActionState } from "@/lib/action-state";

const starter: Record<string, { category: HabitCategory; title: Record<"uz" | "en" | "ru", string>; target: number }> = {
  move: { category: "MOVEMENT", target: 4, title: { uz: "10 daqiqa harakat", en: "Move for 10 minutes", ru: "10 минут движения" } },
  strength: { category: "MOVEMENT", target: 3, title: { uz: "Qisqa kuch mashqi", en: "Short strength routine", ru: "Короткая силовая тренировка" } },
  sleep: { category: "SLEEP", target: 5, title: { uz: "Uxlashdan oldin ekransiz 30 daqiqa", en: "30 screen-free minutes before bed", ru: "30 минут без экрана перед сном" } },
  eat: { category: "MEALS", target: 5, title: { uz: "Ovqatga sabzavot qoʻshish", en: "Add vegetables to a meal", ru: "Добавить овощи к приёму пищи" } },
  learn: { category: "LEARNING", target: 3, title: { uz: "5 daqiqalik dars", en: "A 5-minute lesson", ru: "5-минутный урок" } },
  stress: { category: "BREAKS", target: 5, title: { uz: "2 daqiqa nafas mashqi", en: "2 minutes of breathing", ru: "2 минуты дыхания" } },
};

export async function completeOnboardingAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await assertUser();
  const { t, locale } = await getI18n();
  const parsed = onboardingSchema.safeParse({
    experienceLevel: formData.get("experienceLevel"),
    goals: formData.getAll("goals"),
    minutesPerDay: formData.get("minutesPerDay"),
    starterHabits: formData.get("starterHabits") === "on",
  });
  if (!parsed.success) return { error: t.common.errorGeneric };
  const { experienceLevel, goals, minutesPerDay, starterHabits } = parsed.data;

  await db.$transaction(async (tx) => {
    await tx.profile.update({ where: { userId: user.id }, data: { experienceLevel, goals, minutesPerDay, onboardingDone: true } });
    if (starterHabits) {
      const existing = await tx.habit.count({ where: { userId: user.id } });
      if (existing === 0) {
        const picks = (goals.length ? goals : ["move"]).slice(0, 3);
        await tx.habit.createMany({
          data: [
            ...picks.map((g) => ({ userId: user.id, title: starter[g].title[locale], category: starter[g].category, targetPerWeek: starter[g].target })),
            { userId: user.id, title: { uz: "Suv ichish", en: "Drink water regularly", ru: "Пить воду регулярно" }[locale], category: "HYDRATION" as const, targetPerWeek: 7 },
          ],
        });
      }
    }
  });
  redirect("/dashboard");
}
