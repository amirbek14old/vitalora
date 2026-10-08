import type { Locale } from "./config";

export const intlTag: Record<Locale, string> = { uz: "uz-Latn-UZ", en: "en-GB", ru: "ru-RU" };

export function weekdayShort(dateIso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(intlTag[locale], { weekday: "short", timeZone: "UTC" }).format(new Date(`${dateIso}T00:00:00Z`));
}

export function formatDate(d: Date, locale: Locale, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }): string {
  return new Intl.DateTimeFormat(intlTag[locale], { ...opts, timeZone: "UTC" }).format(d);
}
