export const locales = ["uz", "en", "ru"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "uz";
export const LOCALE_COOKIE = "vitalora_locale";

export const localeNames: Record<Locale, string> = { uz: "Oʻzbekcha", en: "English", ru: "Русский" };

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}

/** Pick the best supported locale from an Accept-Language header. */
export function matchAcceptLanguage(header: string | null | undefined): Locale {
  if (!header) return defaultLocale;
  const tags = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { tag: tag.toLowerCase(), q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  for (const { tag } of tags) {
    const base = tag.split("-")[0];
    if (isLocale(base)) return base;
  }
  return defaultLocale;
}

/** Localised JSON content stored in the DB: { uz, en, ru }. Falls back to en → uz → first value. */
export type LocalizedText = Partial<Record<Locale, string>>;
export type LocalizedList = Partial<Record<Locale, string[]>>;

export function tr(value: unknown, locale: Locale): string {
  if (!value || typeof value !== "object") return typeof value === "string" ? value : "";
  const v = value as Record<string, unknown>;
  const pick = v[locale] ?? v.en ?? v.uz ?? Object.values(v)[0];
  return typeof pick === "string" ? pick : "";
}

export function trList(value: unknown, locale: Locale): string[] {
  if (!value || typeof value !== "object") return [];
  const v = value as Record<string, unknown>;
  const pick = v[locale] ?? v.en ?? v.uz;
  return Array.isArray(pick) ? pick.filter((x): x is string => typeof x === "string") : [];
}

/** Simple "{name}" interpolation. */
export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? `{${key}}`));
}
