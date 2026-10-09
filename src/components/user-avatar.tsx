import { BadgeCheck, ChefHat, Crown, Footprints, GraduationCap, Moon } from "lucide-react";
import { BADGES, FRAMES, NAME_COLORS, styleFromCode } from "@/lib/cosmetics";
import { cn } from "@/lib/utils";

const sizes = { xs: 28, sm: 36, md: 48, lg: 96, xl: 128 } as const;

export type AvatarUser = {
  id: string;
  displayName: string;
  avatarVersion?: number | null; // avatar updatedAt as ms, or null if no photo
  frame?: string | null; // equipped item code
};

/** Profile photo (or initials) inside an optional Discord-style frame. */
export function UserAvatar({ user, size = "md", className }: { user: AvatarUser; size?: keyof typeof sizes; className?: string }) {
  const px = sizes[size];
  const frame = FRAMES[styleFromCode(user.frame) ?? ""];
  const ring = frame ? Math.max(2, Math.round(px / 16)) : 0;
  const initials = user.displayName.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full", className)}
      style={{ width: px, height: px, padding: ring, background: frame }}
      aria-hidden
    >
      <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-brand-100 font-semibold text-brand-800 ring-2 ring-white dark:bg-brand-900 dark:text-brand-100 dark:ring-surface-dark" style={{ fontSize: px / 2.6 }}>
        {user.avatarVersion ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/api/avatar/${user.id}?v=${user.avatarVersion}`} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          initials
        )}
      </span>
    </span>
  );
}

export function DisplayName({ name, color, className }: { name: string; color?: string | null; className?: string }) {
  const style = NAME_COLORS[styleFromCode(color) ?? ""];
  if (!style) return <span className={className}>{name}</span>;
  if (style.gradient)
    return (
      <span className={cn("bg-clip-text font-semibold text-transparent", className)} style={{ backgroundImage: style.gradient }}>
        {name}
      </span>
    );
  return <span className={cn("font-semibold", className)} style={{ color: style.color }}>{name}</span>;
}

const badgeIcons = { Footprints, Moon, ChefHat, GraduationCap, Crown };

export function ProfileBadge({ code, label, size = 18 }: { code?: string | null; label?: string; size?: number }) {
  const b = BADGES[styleFromCode(code) ?? ""];
  if (!b) return null;
  const Icon = badgeIcons[b.icon];
  return (
    <span className="inline-flex items-center justify-center rounded-full text-white" style={{ background: b.bg, width: size + 6, height: size + 6 }} title={label} aria-label={label} role="img">
      <Icon style={{ width: size - 4, height: size - 4 }} aria-hidden />
    </span>
  );
}

export function ProTag({ label = "PRO" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5 rounded-md bg-gradient-to-r from-amber-400 to-orange-500 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
      <BadgeCheck className="h-3 w-3" aria-hidden />{label}
    </span>
  );
}
