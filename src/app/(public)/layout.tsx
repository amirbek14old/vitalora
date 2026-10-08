import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getI18n } from "@/lib/i18n/server";
import { getTheme } from "@/lib/theme";
import { getCurrentUser } from "@/lib/auth/session";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const { t, locale } = await getI18n();
  const [theme, user] = await Promise.all([getTheme(), getCurrentUser()]);
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader t={t} locale={locale} theme={theme} loggedIn={!!user} />
      <main id="main" className="flex-1">{children}</main>
      <SiteFooter t={t} />
    </div>
  );
}
