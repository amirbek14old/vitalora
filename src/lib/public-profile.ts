import "server-only";
import type { Prisma } from "@prisma/client";
import type { AvatarUser } from "@/components/user-avatar";

/** Prisma select for the public-safe part of a user (never email, birth year or health data). */
export const publicUserSelect = {
  id: true,
  proUntil: true,
  profile: { select: { displayName: true, bio: true, equippedFrame: true, equippedBanner: true, equippedNameColor: true, equippedBadge: true } },
  preference: { select: { communityVisible: true } },
  avatar: { select: { updatedAt: true } },
} satisfies Prisma.UserSelect;

export type PublicUser = Prisma.UserGetPayload<{ select: typeof publicUserSelect }>;

/** Converts to avatar props; hides photo and cosmetics when the owner is not community-visible (unless it's the viewer). */
export function toAvatarUser(u: PublicUser, viewerId: string, fallbackName: string): AvatarUser & { nameColor: string | null; badge: string | null; pro: boolean; visible: boolean } {
  const visible = u.id === viewerId || !!u.preference?.communityVisible;
  return {
    id: u.id,
    displayName: visible ? u.profile?.displayName ?? fallbackName : fallbackName,
    avatarVersion: visible && u.avatar ? u.avatar.updatedAt.getTime() : null,
    frame: visible ? u.profile?.equippedFrame ?? null : null,
    nameColor: visible ? u.profile?.equippedNameColor ?? null : null,
    badge: visible ? u.profile?.equippedBadge ?? null : null,
    pro: visible && !!u.proUntil && u.proUntil > new Date(),
    visible,
  };
}
