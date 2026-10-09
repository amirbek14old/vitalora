import Link from "next/link";
import { Eye, LogOut, Sparkles } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { getI18n } from "@/lib/i18n/server";
import { formatDate } from "@/lib/i18n/format";
import { isPro } from "@/lib/coins";
import { logoutAction } from "@/app/actions/auth";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button";
import { ProfileForm } from "@/components/settings/profile-form";
import { ProfileHeader } from "@/components/profile/profile-header";
import { AvatarUploader } from "@/components/profile/avatar-uploader";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.profile.title };
}

export default async function ProfilePage() {
  const user = await requireUser();
  const { t, locale } = await getI18n();
  const p = user.profile!;
  const [avatar, workouts, achievements] = await Promise.all([
    db.avatar.findUnique({ where: { userId: user.id }, select: { updatedAt: true } }),
    db.workoutSession.count({ where: { userId: user.id } }),
    db.userAchievement.count({ where: { userId: user.id } }),
  ]);

  return (
    <div className="space-y-6">
      <ProfileHeader
        data={{
          id: user.id, displayName: p.displayName, bio: p.bio, avatarVersion: avatar?.updatedAt.getTime() ?? null,
          frame: p.equippedFrame, banner: p.equippedBanner, nameColor: p.equippedNameColor, badge: p.equippedBadge, pro: isPro(user),
        }}
        stats={[
          { label: t.coins.balance, value: user.coins },
          { label: t.dashboard.workouts, value: workouts },
          { label: t.nav.achievements, value: achievements },
        ]}
      >
        <ButtonLink href="/shop" size="sm"><Sparkles className="h-4 w-4" aria-hidden />{t.profile.customize}</ButtonLink>
        <ButtonLink href={`/u/${user.id}`} size="sm" variant="outline"><Eye className="h-4 w-4" aria-hidden />{t.profile.viewPublic}</ButtonLink>
      </ProfileHeader>

      {!user.preference?.communityVisible && (
        <Alert tone="info">{t.profile.privateNote} <Link href="/settings" className="font-medium underline">{t.nav.settings}</Link></Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="space-y-6 lg:col-span-2">
          <div>
            <CardTitle className="mb-3">{t.profile.photo}</CardTitle>
            <AvatarUploader
              hasPhoto={!!avatar}
              labels={{ upload: t.profile.uploadPhoto, change: t.profile.changePhoto, remove: t.profile.removePhoto, hint: t.profile.photoHint, error: t.common.errorGeneric, tooLarge: t.foodScan.tooLarge }}
            />
          </div>
          <div className="border-t border-slate-200 pt-6 dark:border-slate-700">
            <ProfileForm profile={p} t={{ profile: t.profile, common: t.common, onboarding: t.onboarding }} />
          </div>
        </Card>
        <div className="space-y-4">
          <Card className="space-y-3 text-sm">
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
              <p className="break-all font-medium">{user.email}</p>
            </div>
          </Card>
          <form action={logoutAction}>
            <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-slate-600 dark:text-red-300 dark:hover:bg-red-950">
              <LogOut className="h-4 w-4" aria-hidden />{t.nav.logout}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
