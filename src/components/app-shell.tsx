import { LogOut } from "lucide-react";
import { Logo } from "./logo";
import { AppNav, MobileNav, type NavItem } from "./app-nav";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "./theme-toggle";
import { logoutAction } from "@/app/actions/auth";
import type { Dictionary } from "@/lib/i18n/types";
import type { Locale } from "@/lib/i18n/config";

export function AppShell({ t, locale, theme, role, children }: { t: Dictionary; locale: Locale; theme: "light" | "dark" | "system"; role: string; children: React.ReactNode }) {
  const items: NavItem[] = [
    { key: "dashboard", href: "/dashboard", label: t.nav.dashboard },
    { key: "fitness", href: "/fitness", label: t.nav.fitness },
    { key: "history", href: "/fitness/history", label: t.nav.history },
    { key: "nutrition", href: "/nutrition", label: t.nav.nutrition },
    { key: "recipes", href: "/nutrition/recipes", label: t.nav.recipes },
    { key: "foodScan", href: "/nutrition/scan", label: t.nav.foodScan },
    { key: "sleep", href: "/sleep", label: t.nav.sleep },
    { key: "habits", href: "/habits", label: t.nav.habits },
    { key: "assistant", href: "/assistant", label: t.nav.assistant },
    { key: "academy", href: "/academy", label: t.nav.academy },
    { key: "community", href: "/community", label: t.nav.community },
    { key: "achievements", href: "/achievements", label: t.nav.achievements },
    { key: "profile", href: "/profile", label: t.nav.profile },
    { key: "settings", href: "/settings", label: t.nav.settings },
    { key: "help", href: "/help", label: t.nav.help },
  ];
  if (role === "ADMIN" || role === "MODERATOR") items.push({ key: "admin", href: "/admin", label: t.nav.admin });

  const logout = (
    <form action={logoutAction}>
      <button type="submit" className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
        <LogOut className="h-4 w-4" aria-hidden /> {t.nav.logout}
      </button>
    </form>
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[16rem_1fr]">
      <div className="hidden border-r border-slate-200 bg-white lg:block dark:border-slate-800 dark:bg-surface-dark">
      <aside className="lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
        <div className="flex h-16 items-center px-5"><Logo href="/dashboard" /></div>
        <nav aria-label={t.nav.menu} className="flex-1 overflow-y-auto px-3 pb-3"><AppNav items={items} /></nav>
        <div className="border-t border-slate-200 p-3 dark:border-slate-800">{logout}</div>
      </aside>
      </div>
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-surface-light/90 px-4 backdrop-blur dark:border-slate-800 dark:bg-surface-dark/90">
          <div className="flex items-center gap-3 lg:hidden">
            <Logo href="/dashboard" />
          </div>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-2">
            <div className="hidden sm:block"><LanguageSwitcher locale={locale} label={t.common.language} /></div>
            <ThemeToggle initial={theme} labels={{ light: t.common.light, dark: t.common.dark, system: t.common.system }} />
            <MobileNav
              items={items}
              menuLabel={t.nav.menu}
              extra={
                <>
                  <div className="px-3 sm:hidden"><LanguageSwitcher id="locale-select-mobile" locale={locale} label={t.common.language} /></div>
                  {logout}
                </>
              }
            />
          </div>
        </header>
        <main id="main" className="mx-auto max-w-6xl px-4 py-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
