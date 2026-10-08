"use server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { LOCALE_COOKIE, isLocale } from "@/lib/i18n/config";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";

const YEAR = 60 * 60 * 24 * 365;

export async function setLocaleAction(formData: FormData) {
  const locale = formData.get("locale");
  if (!isLocale(locale)) return;
  const store = await cookies();
  store.set(LOCALE_COOKIE, locale, { path: "/", maxAge: YEAR, sameSite: "lax" });
  const user = await getCurrentUser();
  if (user) await db.preference.upsert({ where: { userId: user.id }, update: { locale }, create: { userId: user.id, locale } });
  revalidatePath("/", "layout");
}

export async function setThemeAction(theme: "light" | "dark" | "system") {
  if (!["light", "dark", "system"].includes(theme)) return;
  const store = await cookies();
  store.set("vitalora_theme", theme, { path: "/", maxAge: YEAR, sameSite: "lax" });
  const user = await getCurrentUser();
  if (user) await db.preference.upsert({ where: { userId: user.id }, update: { theme }, create: { userId: user.id, theme } });
}
