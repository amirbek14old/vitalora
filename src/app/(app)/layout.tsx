import { requireUser } from "@/lib/auth/guards";
import { getI18n } from "@/lib/i18n/server";
import { getTheme } from "@/lib/theme";
import { AppShell } from "@/components/app-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const { t, locale } = await getI18n();
  const theme = await getTheme();
  return (
    <AppShell t={t} locale={locale} theme={theme} role={user.role}>
      {children}
    </AppShell>
  );
}
