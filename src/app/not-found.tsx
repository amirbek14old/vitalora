import { getI18n } from "@/lib/i18n/server";
import { ButtonLink } from "@/components/ui/button";

export default async function NotFound() {
  const { t } = await getI18n();
  return (
    <main id="main" className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl font-bold text-brand-700">404</p>
      <p className="mt-4 text-slate-600 dark:text-slate-300">{t.common.emptyTitle}</p>
      <ButtonLink href="/" className="mt-6">{t.nav.home}</ButtonLink>
    </main>
  );
}
