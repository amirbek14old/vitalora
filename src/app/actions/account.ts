"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { assertUser } from "@/lib/auth/guards";
import { destroySession, SESSION_COOKIE } from "@/lib/auth/session";
import { hashToken } from "@/lib/auth/tokens";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { passwordSchema, profileSchema, settingsSchema, formBool } from "@/lib/validation";
import { LOCALE_COOKIE } from "@/lib/i18n/config";
import { audit } from "@/lib/audit";
import { getI18n } from "@/lib/i18n/server";
import type { ActionState } from "@/lib/action-state";

export async function updateProfileAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await assertUser();
  const { t } = await getI18n();
  const parsed = profileSchema.safeParse({
    displayName: formData.get("displayName"),
    bio: formData.get("bio") ?? "",
    experienceLevel: formData.get("experienceLevel"),
    minutesPerDay: formData.get("minutesPerDay"),
    goals: formData.getAll("goals"),
  });
  if (!parsed.success) return { error: t.auth.displayNameHint };
  await db.profile.update({ where: { userId: user.id }, data: { ...parsed.data, bio: parsed.data.bio || null } });
  revalidatePath("/profile");
  return { ok: true, message: t.profile.saved };
}

export async function updateSettingsAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await assertUser();
  const { t } = await getI18n();
  const parsed = settingsSchema.safeParse({
    locale: formData.get("locale"),
    theme: formData.get("theme"),
    aiConsent: formBool(formData, "aiConsent"),
    aiPersonalizationConsent: formBool(formData, "aiPersonalizationConsent"),
    analyticsConsent: formBool(formData, "analyticsConsent"),
    communityVisible: formBool(formData, "communityVisible"),
    remindersEnabled: formBool(formData, "remindersEnabled"),
    reminderTime: formData.get("reminderTime") ?? "",
  });
  if (!parsed.success) return { error: t.common.errorGeneric };
  const d = parsed.data;
  // Personalisation depends on general AI consent.
  const aiPersonalizationConsent = d.aiConsent && d.aiPersonalizationConsent;
  const before = user.preference;
  await db.preference.upsert({
    where: { userId: user.id },
    update: { ...d, aiPersonalizationConsent, reminderTime: d.reminderTime || null },
    create: { ...d, aiPersonalizationConsent, reminderTime: d.reminderTime || null, userId: user.id },
  });
  if (before?.aiConsent !== d.aiConsent || before?.aiPersonalizationConsent !== aiPersonalizationConsent) {
    await audit("consent.change", user.id, undefined, { aiConsent: d.aiConsent, aiPersonalizationConsent });
  }
  const store = await cookies();
  store.set(LOCALE_COOKIE, d.locale, { path: "/", maxAge: 31536000, sameSite: "lax" });
  store.set("vitalora_theme", d.theme, { path: "/", maxAge: 31536000, sameSite: "lax" });
  revalidatePath("/", "layout");
  const { t: t2 } = await getI18n();
  return { ok: true, message: t2.settings.saved };
}

export async function changePasswordAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await assertUser();
  const { t } = await getI18n();
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const next = passwordSchema.safeParse(formData.get("newPassword"));
  if (!next.success) return { error: t.auth.passwordHint };
  if (!(await verifyPassword(currentPassword, user.passwordHash))) return { error: t.auth.invalidCredentials };
  await db.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(next.data) } });
  // Revoke every other session so a stolen session can't outlive a password change.
  const current = (await cookies()).get(SESSION_COOKIE)?.value;
  await db.session.deleteMany({ where: { userId: user.id, ...(current ? { NOT: { tokenHash: hashToken(current) } } : {}) } });
  await audit("auth.password_change", user.id);
  return { ok: true, message: t.settings.saved };
}

export async function deleteAccountAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await assertUser();
  const { t } = await getI18n();
  if (formData.get("confirm") !== "DELETE") return { error: t.settings.deleteConfirm };
  if (!(await verifyPassword(String(formData.get("password") ?? ""), user.passwordHash))) return { error: t.auth.invalidCredentials };
  // Audit entry is written without the user id so no personal link remains after deletion.
  await audit("account.delete", null, undefined, { role: user.role });
  await destroySession();
  // Cascading foreign keys remove profile, preferences, logs, habits, posts, reports, AI conversations and notifications.
  await db.user.delete({ where: { id: user.id } });
  redirect("/");
}

export async function markNotificationsReadAction() {
  const user = await assertUser();
  await db.notification.updateMany({ where: { userId: user.id, read: false }, data: { read: true } });
  revalidatePath("/settings");
}
