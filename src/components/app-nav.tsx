"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award, BookOpen, Bot, Camera, ChefHat, Dumbbell, HelpCircle, History, LayoutDashboard, ListChecks, Moon, Salad, Settings, Shield, ShoppingBag, User, Users, Video, Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";

const icons = {
  dashboard: LayoutDashboard, fitness: Dumbbell, history: History, nutrition: Salad, recipes: ChefHat, foodScan: Camera, sleep: Moon,
  habits: ListChecks, assistant: Bot, coach: Video, shop: ShoppingBag, pro: Crown, academy: BookOpen, community: Users, achievements: Award, profile: User, settings: Settings, help: HelpCircle, admin: Shield,
} as const;

export type NavItem = { key: keyof typeof icons; href: string; label: string };

export function AppNav({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <ul className="space-y-0.5">
      {items.map((item) => {
        const Icon = icons[item.key];
        // Exact match, or a sub-page — unless a more specific item (e.g. /fitness/coach) also matches.
        const active =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href + "/") && !items.some((o) => o.href !== item.href && o.href.startsWith(item.href + "/") && pathname.startsWith(o.href)));
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              prefetch={false}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-brand-50 text-brand-800 dark:bg-brand-900/50 dark:text-brand-100"
                  : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function MobileNav({ items, menuLabel, extra }: { items: NavItem[]; menuLabel: string; extra?: React.ReactNode }) {
  return (
    <details className="group lg:hidden">
      <summary className="flex h-9 cursor-pointer list-none items-center rounded-lg border border-slate-300 px-3 text-sm font-medium dark:border-slate-600">
        {menuLabel}
      </summary>
      <nav aria-label={menuLabel} className="absolute left-0 right-0 top-16 z-40 max-h-[75vh] overflow-y-auto border-b border-slate-200 bg-white p-3 shadow-lg dark:border-slate-800 dark:bg-surface-dark">
        <AppNav
          items={items}
          onNavigate={() => document.querySelectorAll("details[open]").forEach((d) => d.removeAttribute("open"))}
        />
        {extra && <div className="mt-3 space-y-2 border-t border-slate-200 pt-3 dark:border-slate-800">{extra}</div>}
      </nav>
    </details>
  );
}
