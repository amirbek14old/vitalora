"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { assertUser } from "@/lib/auth/guards";
import { isPro } from "@/lib/coins";
import { AVATAR_PRESET_MAP } from "@/lib/avatars";
import { getI18n } from "@/lib/i18n/server";
import type { ActionState } from "@/lib/action-state";

/** Use a ready-made picture as the profile picture (replaces an uploaded photo). */
export async function setAvatarPresetAction(key: string): Promise<ActionState> {
  const user = await assertUser();
  const { t } = await getI18n();
  const preset = AVATAR_PRESET_MAP[key];
  if (!preset) return { error: t.common.errorGeneric };
  if (preset.pro && !isPro(user)) return { error: t.shop.needPro };
  await db.$transaction([
    db.profile.update({ where: { userId: user.id }, data: { avatarPreset: key } }),
    db.avatar.deleteMany({ where: { userId: user.id } }),
  ]);
  revalidatePath("/", "layout");
  return { ok: true, message: t.profile.pictureSaved };
}
