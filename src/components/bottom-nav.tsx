"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, Dumbbell, LayoutDashboard, ListChecks, User } from "lucide-react";
import { cn } from "@/lib/utils";

export type BottomNavLabels = { dashboard: string; fitness: string; coach: string; habits: string; profile: string };

/** Thumb-friendly tab bar for phones (hidden on large screens). Respects the iPhone home-indicator safe area. */
export function BottomNav({ labels }: { labels: BottomNavLabels }) {
  const pathname = usePathname();
  const items = [
    { href: "/dashboard", label: labels.dashboard, Icon: LayoutDashboard },
    { href: "/fitness", label: labels.fitness, Icon: Dumbbell, exact: true },
    { href: "/fitness/coach", label: labels.coach, Icon: Camera, primary: true },
    { href: "/habits", label: labels.habits, Icon: ListChecks },
    { href: "/profile", label: labels.profile, Icon: User },
  ];
  return (
    <nav
      aria-label="Tabs"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur lg:hidden dark:border-slate-800 dark:bg-surface-dark/95"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {items.map(({ href, label, Icon, primary, exact }) => {
          const active = exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
          return (
            <li key={href}>
              <Link
                href={href}
                prefetch={false}
                aria-current={active ? "page" : undefined}
                className={cn("flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-[11px] font-medium", active ? "text-brand-700 dark:text-brand-400" : "text-slate-500 dark:text-slate-400")}
              >
                {primary ? (
                  <span className={cn("-mt-5 flex h-12 w-12 items-center justify-center rounded-full shadow-lg", active ? "bg-brand-800" : "bg-brand-700 dark:bg-brand-500")}>
                    <Icon className="h-6 w-6 text-white dark:text-slate-950" aria-hidden />
                  </span>
                ) : (
                  <Icon className="h-6 w-6" aria-hidden />
                )}
                <span className="truncate">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
