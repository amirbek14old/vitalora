import Link from "next/link";
import type { Dictionary } from "@/lib/i18n/types";

export function SiteFooter({ t }: { t: Dictionary }) {
  return (
    <footer className="border-t border-slate-200 py-8 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-400">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} VITALORA · {t.common.slogan}</p>
        <nav aria-label="Footer" className="flex flex-wrap gap-4">
          <Link href="/about" className="hover:underline">{t.nav.about}</Link>
          <Link href="/features" className="hover:underline">{t.nav.features}</Link>
          <Link href="/help" className="hover:underline">{t.nav.help}</Link>
          <Link href="/privacy" className="hover:underline">{t.nav.privacy}</Link>
          <Link href="/terms" className="hover:underline">{t.nav.terms}</Link>
        </nav>
      </div>
      <p className="mx-auto mt-4 max-w-6xl px-4 text-xs">{t.common.notMedical}</p>
    </footer>
  );
}
