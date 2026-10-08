import { Check } from "lucide-react";
import { toggleHabitAction } from "@/app/actions/habits";
import { cn } from "@/lib/utils";

/** Progressive-enhancement toggle (works without JS). */
export function HabitToggle({ habitId, date, done, label, disabled }: { habitId: string; date: string; done: boolean; label: string; disabled?: boolean }) {
  return (
    <form action={toggleHabitAction}>
      <input type="hidden" name="habitId" value={habitId} />
      <input type="hidden" name="date" value={date} />
      <button
        type="submit"
        disabled={disabled}
        aria-pressed={done}
        aria-label={label}
        title={label}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors disabled:opacity-40",
          done ? "border-brand-600 bg-brand-600 text-white dark:border-brand-400 dark:bg-brand-500" : "border-slate-300 text-transparent hover:border-brand-500 dark:border-slate-600",
        )}
      >
        <Check className="h-4 w-4" aria-hidden />
      </button>
    </form>
  );
}
