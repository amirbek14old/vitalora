import { requireUser } from "@/lib/auth/guards";
import { getI18n } from "@/lib/i18n/server";
import { getTheme } from "@/lib/theme";
import { AppShell } from "@/components/app-shell";
import { db } from "@/lib/db";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const { t, locale } = await getI18n();
  const theme = await getTheme();
  const avatar = await db.avatar.findUnique({ where: { userId: user.id }, select: { updatedAt: true } });
  const me = { id: user.id, displayName: user.profile?.displayName ?? "", avatarVersion: avatar?.updatedAt.getTime() ?? null, frame: user.profile?.equippedFrame ?? null };
  return (
    <AppShell t={t} locale={locale} theme={theme} role={user.role} coins={user.coins} me={me}>
      {children}
    </AppShell>
  );
}
