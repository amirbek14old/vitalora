import { BANNERS, styleFromCode } from "@/lib/cosmetics";
import { UserAvatar, DisplayName, ProfileBadge, ProTag } from "@/components/user-avatar";

export type ProfileHeaderData = {
  id: string;
  displayName: string;
  bio?: string | null;
  avatarVersion: number | null;
  frame: string | null;
  banner: string | null;
  nameColor: string | null;
  badge: string | null;
  pro: boolean;
};

/** Discord-style profile card: banner, framed avatar, coloured name, badge. */
export function ProfileHeader({ data, stats, children }: { data: ProfileHeaderData; stats?: { label: string; value: string | number }[]; children?: React.ReactNode }) {
  const banner = BANNERS[styleFromCode(data.banner) ?? "default"] ?? BANNERS.default;
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-surface-carddark">
      <div className="h-28 sm:h-36" style={{ background: banner }} aria-hidden />
      <div className="px-5 pb-5">
        <div className="-mt-12 flex flex-wrap items-end justify-between gap-3 sm:-mt-14">
          <UserAvatar user={data} size="lg" className="rounded-full bg-white p-0 dark:bg-surface-carddark" />
          {children && <div className="flex flex-wrap gap-2">{children}</div>}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold"><DisplayName name={data.displayName} color={data.nameColor} /></h1>
          <ProfileBadge code={data.badge} size={20} />
          {data.pro && <ProTag />}
        </div>
        {data.bio && <p className="mt-2 max-w-xl whitespace-pre-line text-slate-600 dark:text-slate-300">{data.bio}</p>}
        {stats && (
          <dl className="mt-4 flex flex-wrap gap-6">
            {stats.map((s) => (
              <div key={s.label}><dt className="text-xs text-slate-500">{s.label}</dt><dd className="text-lg font-bold">{s.value}</dd></div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}
