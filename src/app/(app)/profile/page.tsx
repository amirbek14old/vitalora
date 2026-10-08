import { requireUser } from "@/lib/auth/guards";
import { getI18n } from "@/lib/i18n/server";
import { formatDate } from "@/lib/i18n/format";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProfileForm } from "@/components/settings/profile-form";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.profile.title };
}

export default async function ProfilePage() {
  const user = await requireUser();
  const { t, locale } = await getI18n();
  const p = user.profile!;
  return (
    <div className="space-y-6">
      <PageHeader title={t.profile.title} />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <ProfileForm profile={p} t={{ profile: t.profile, common: t.common, onboarding: t.onboarding }} />
        </Card>
        <Card className="h-fit space-y-3 text-sm">
          <div>
            <p className="text-slate-500">{t.profile.ageGroup}</p>
            <Badge tone={p.ageGroup === "TEEN" ? "amber" : "brand"}>{p.ageGroup === "TEEN" ? t.profile.teen : t.profile.adult}</Badge>
          </div>
          <div>
            <p className="text-slate-500">{t.profile.memberSince}</p>
            <p className="font-medium">{formatDate(user.createdAt, locale)}</p>
          </div>
          <div>
            <p className="text-slate-500">{t.auth.email}</p>
            <p className="font-medium">{user.email}</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
