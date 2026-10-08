import type { LucideIcon } from "lucide-react";

export function EmptyState({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
      <Icon className="mb-3 h-8 w-8 text-brand-600 dark:text-brand-400" aria-hidden />
      <p className="font-medium text-slate-800 dark:text-slate-100">{title}</p>
      {children && <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">{children}</div>}
    </div>
  );
}
