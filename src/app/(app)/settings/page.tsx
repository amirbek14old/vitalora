import { Bell, Download } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { getI18n } from "@/lib/i18n/server";
import { tr } from "@/lib/i18n/config";
import { formatDate } from "@/lib/i18n/format";
import { markNotificationsReadAction } from "@/app/actions/account";
import { PageHeader } from "@/components/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { SubmitButton } from "@/components/submit-button";
import { DeleteAccountForm, PasswordForm, PreferencesForm } from "@/components/settings/settings-forms";
import { cn } from "@/lib/utils";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.settings.title };
}

export default async function SettingsPage() {
  const user = await requireUser();
  const { t, locale } = await getI18n();
  const pref = user.preference;
  const [notifications, achievements] = await Promise.all([
    db.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 20 }),
    db.achievement.findMany({ select: { code: true, title: true } }),
  ]);
  const achTitle = new Map(achievements.map((a) => [a.code, tr(a.title, locale)]));
  const notifText = (n: { kind: string; title: string }) =>
    n.kind === "achievement" ? `${t.achievements.earned}: ${achTitle.get(n.title) ?? n.title}` : n.title === "moderation.hidden" ? t.settings.postHidden : n.title;

  const ts = { settings: t.settings, common: t.common };
  return (
    <div className="space-y-6">
      <PageHeader title={t.settings.title} />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardTitle className="mb-4">{t.settings.preferences}</CardTitle>
          <PreferencesForm
            t={ts}
            prefs={{
              locale: pref?.locale ?? locale, theme: pref?.theme ?? "system", aiConsent: !!pref?.aiConsent, aiPersonalizationConsent: !!pref?.aiPersonalizationConsent,
              analyticsConsent: !!pref?.analyticsConsent, communityVisible: !!pref?.communityVisible, remindersEnabled: !!pref?.remindersEnabled, reminderTime: pref?.reminderTime ?? null,
            }}
          />
        </Card>
        <Card className="h-fit">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Bell className="h-4 w-4" aria-hidden />{t.settings.notifications}</CardTitle>
            {notifications.some((n) => !n.read) && (
              <form action={markNotificationsReadAction}><SubmitButton size="sm" variant="ghost">{t.settings.markRead}</SubmitButton></form>
            )}
          </div>
          {notifications.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">{t.settings.noNotifications}</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {notifications.map((n) => (
                <li key={n.id} className={cn("rounded-lg p-2", !n.read && "bg-brand-50 dark:bg-brand-900/30")}>
                  <p>{notifText(n)}</p>
                  <p className="text-xs text-slate-500">{formatDate(n.createdAt, locale)}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardTitle className="mb-4">{t.settings.password}</CardTitle>
          <PasswordForm t={ts} labels={{ current: t.settings.currentPassword, next: t.settings.newPassword, hint: t.auth.passwordHint }} />
        </Card>
        <Card>
          <CardTitle className="mb-4">{t.settings.data}</CardTitle>
          <a href="/api/account/export" className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-medium hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800">
            <Download className="h-4 w-4" aria-hidden />{t.settings.export}
          </a>
        </Card>
        <Card className="border-red-200 dark:border-red-900">
          <CardTitle className="mb-4 text-red-800 dark:text-red-200">{t.settings.deleteAccount}</CardTitle>
          <DeleteAccountForm t={ts} passwordLabel={t.auth.password} />
        </Card>
      </div>
    </div>
  );
}
