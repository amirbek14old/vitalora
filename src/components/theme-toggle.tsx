"use client";
import { useState, useTransition } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { setThemeAction } from "@/app/actions/preferences";

type Theme = "light" | "dark" | "system";

function apply(theme: Theme) {
  const dark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

export function ThemeToggle({ initial, labels }: { initial: Theme; labels: Record<Theme, string> }) {
  const [theme, setTheme] = useState<Theme>(initial);
  const [, startTransition] = useTransition();
  const next: Theme = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
  const Icon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;
  return (
    <button
      type="button"
      onClick={() => {
        setTheme(next);
        apply(next);
        startTransition(() => setThemeAction(next));
      }}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
      aria-label={`${labels[theme]} → ${labels[next]}`}
      title={labels[theme]}
    >
      <Icon className="h-4 w-4" aria-hidden />
    </button>
  );
}
