import "server-only";
import { cookies, headers } from "next/headers";
import { LOCALE_COOKIE, isLocale, matchAcceptLanguage, type Locale } from "./config";
import type { Dictionary } from "./types";
import en from "./dictionaries/en";
import uz from "./dictionaries/uz";
import ru from "./dictionaries/ru";

const dictionaries: Record<Locale, Dictionary> = { uz, en, ru };

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(LOCALE_COOKIE)?.value;
  if (isLocale(fromCookie)) return fromCookie;
  const h = await headers();
  return matchAcceptLanguage(h.get("accept-language"));
}

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export async function getI18n() {
  const locale = await getLocale();
  return { locale, t: getDictionary(locale) };
}
