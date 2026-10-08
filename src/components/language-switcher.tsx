"use client";
import { useRef } from "react";
import { Languages } from "lucide-react";
import { setLocaleAction } from "@/app/actions/preferences";
import { locales, localeNames, type Locale } from "@/lib/i18n/config";

export function LanguageSwitcher({ locale, label, id = "locale-select" }: { locale: Locale; label: string; id?: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <form ref={formRef} action={setLocaleAction} className="flex items-center gap-1.5">
      <Languages className="h-4 w-4 text-slate-500" aria-hidden />
      <label htmlFor={id} className="sr-only">{label}</label>
      <select
        id={id}
        name="locale"
        defaultValue={locale}
        onChange={() => formRef.current?.requestSubmit()}
        className="h-9 rounded-lg border border-slate-300 bg-transparent px-2 text-sm dark:border-slate-600 dark:bg-slate-900"
      >
        {locales.map((l) => (
          <option key={l} value={l} lang={l}>{localeNames[l]}</option>
        ))}
      </select>
      <noscript><button type="submit" className="text-sm underline">OK</button></noscript>
    </form>
  );
}
