import Link from "next/link";
import { Logo } from "./logo";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "./theme-toggle";
import { ButtonLink } from "./ui/button";
import type { Dictionary } from "@/lib/i18n/types";
import type { Locale } from "@/lib/i18n/config";

export function SiteHeader({ t, locale, theme, loggedIn }: { t: Dictionary; locale: Locale; theme: "light" | "dark" | "system"; loggedIn: boolean }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-surface-light/90 backdrop-blur dark:border-slate-800 dark:bg-surface-dark/90">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-6 text-sm font-medium text-slate-700 md:flex dark:text-slate-200">
          <Link href="/features" className="hover:text-brand-700 dark:hover:text-brand-400">{t.nav.features}</Link>
          <Link href="/about" className="hover:text-brand-700 dark:hover:text-brand-400">{t.nav.about}</Link>
          <Link href="/help" className="hover:text-brand-700 dark:hover:text-brand-400">{t.nav.help}</Link>
        </nav>
        <div className="flex items-center gap-2">
          <div className="hidden sm:block"><LanguageSwitcher locale={locale} label={t.common.language} /></div>
          <ThemeToggle initial={theme} labels={{ light: t.common.light, dark: t.common.dark, system: t.common.system }} />
          {loggedIn ? (
            <ButtonLink href="/dashboard" size="sm">{t.nav.dashboard}</ButtonLink>
          ) : (
            <>
              <ButtonLink href="/login" variant="ghost" size="sm">{t.nav.login}</ButtonLink>
              <ButtonLink href="/register" size="sm" className="hidden sm:inline-flex">{t.nav.register}</ButtonLink>
            </>
          )}
        </div>
      </div>
      <div className="flex justify-center pb-2 sm:hidden"><LanguageSwitcher id="locale-select-mobile" locale={locale} label={t.common.language} /></div>
    </header>
  );
}
