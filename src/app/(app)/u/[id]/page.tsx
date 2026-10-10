import { notFound } from "next/navigation";
import { Lock } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { getI18n } from "@/lib/i18n/server";
import { formatDate } from "@/lib/i18n/format";
import { tr } from "@/lib/i18n/config";
import { publicUserSelect } from "@/lib/public-profile";
import { ProfileHeader } from "@/components/profile/profile-header";
import { Card, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { AchievementIcon } from "@/components/achievement-icon";

/** Public profile: only for logged-in members, and only if the owner opted into community visibility. */
export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const viewer = await requireUser();
  const { t, locale } = await getI18n();
  const u = await db.user.findUnique({ where: { id }, select: { ...publicUserSelect, createdAt: true } });
  if (!u || !u.profile) notFound();
  const visible = u.id === viewer.id || !!u.preference?.communityVisible;
  if (!visible) {
    return <EmptyState icon={Lock} title={t.profile.hidden} />;
  }
  const achievements = await db.userAchievement.findMany({ where: { userId: u.id }, include: { achievement: true }, orderBy: { earnedAt: "desc" }, take: 12 });
  return (
    <div className="space-y-6">
      <ProfileHeader
        data={{
          id: u.id, displayName: u.profile.displayName, bio: u.profile.bio, avatarVersion: u.avatar?.updatedAt.getTime() ?? null, preset: u.profile.avatarPreset,
          frame: u.profile.equippedFrame, banner: u.profile.equippedBanner, nameColor: u.profile.equippedNameColor, badge: u.profile.equippedBadge,
          pro: !!u.proUntil && u.proUntil > new Date(),
        }}
        stats={[{ label: t.profile.memberSince, value: formatDate(u.createdAt, locale, { month: "short", year: "numeric" }) }, { label: t.nav.achievements, value: achievements.length }]}
      />
      <Card>
        <CardTitle>{t.nav.achievements}</CardTitle>
        {achievements.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">{t.dashboard.noAchievements}</p>
        ) : (
          <ul className="mt-3 flex flex-wrap gap-3">
            {achievements.map((a) => (
              <li key={a.id} className="flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-sm dark:bg-amber-900/30">
                <AchievementIcon name={a.achievement.icon} className="h-4 w-4 text-amber-600" />{tr(a.achievement.title, locale)}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
