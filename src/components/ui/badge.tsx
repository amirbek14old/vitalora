import { cn } from "@/lib/utils";

const tones = {
  brand: "bg-brand-50 text-brand-800 dark:bg-brand-900/50 dark:text-brand-100",
  slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  amber: "bg-amber-50 text-amber-800 dark:bg-amber-900/40 dark:text-amber-100",
  red: "bg-red-50 text-red-800 dark:bg-red-900/40 dark:text-red-100",
} as const;

export function Badge({ tone = "brand", className, ...props }: React.HTMLAttributes<HTMLSpanElement> & { tone?: keyof typeof tones }) {
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", tones[tone], className)} {...props} />;
}
