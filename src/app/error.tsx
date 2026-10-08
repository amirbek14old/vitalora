"use client";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

// Rendered for unexpected errors. Shown in all three languages because the dictionary may be unavailable here.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main id="main" className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-2 px-4 text-center">
      <h1 className="text-2xl font-bold">Xatolik yuz berdi</h1>
      <p className="text-slate-600 dark:text-slate-300" lang="en">Something went wrong.</p>
      <p className="text-slate-600 dark:text-slate-300" lang="ru">Что-то пошло не так.</p>
      {error.digest && <p className="font-mono text-xs text-slate-400">{error.digest}</p>}
      <Button className="mt-4" onClick={reset} aria-label="Qayta urinish / Try again / Повторить">↻ Qayta urinish</Button>
    </main>
  );
}
