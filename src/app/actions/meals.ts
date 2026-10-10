"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { assertUser, isTeen } from "@/lib/auth/guards";
import { saveMealSchema } from "@/lib/validation";
import { totals } from "@/lib/ai/food";
import { evaluateAchievements } from "@/lib/achievements";

export async function saveMealAction(input: unknown): Promise<{ ok: boolean }> {
  const user = await assertUser();
  const parsed = saveMealSchema.safeParse(input);
  if (!parsed.success) return { ok: false };
  const teen = isTeen(user);
  const items = teen
    ? parsed.data.items.map(({ name, portionGrams, foodGroup }) => ({ name, portionGrams, foodGroup }))
    : parsed.data.items;
  const meal = await db.mealLog.create({
    data: {
      userId: user.id,
      source: "photo",
      items,
      totalKcal: teen ? null : totals(parsed.data.items).kcal,
      balanceNote: parsed.data.balanceNote?.slice(0, 500) || null,
    },
  });
  await evaluateAchievements(user.id, ["first_meal"]);
  revalidatePath("/nutrition/scan");
  return { ok: true };
}

export async function deleteMealAction(formData: FormData) {
  const user = await assertUser();
  await db.mealLog.deleteMany({ where: { id: String(formData.get("id") ?? ""), userId: user.id } });
  revalidatePath("/nutrition/scan");
}
