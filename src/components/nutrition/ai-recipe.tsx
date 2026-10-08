"use client";
import { useState } from "react";
import Link from "next/link";
import { ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/form";
import { Alert } from "@/components/ui/alert";

type Labels = { placeholder: string; ask: string; loading: string; error: string; notConfigured: string; rateLimited: string; disclaimer: string; open: string; label: string };

export function AIRecipe({ labels }: { labels: Labels }) {
  const [text, setText] = useState("");
  const [state, setState] = useState<{ status: "idle" | "loading" | "done" | "error"; reply?: string; id?: string }>({ status: "idle" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/ai/chat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ mode: "recipe", message: text.trim() }) });
      const data = await res.json();
      if (!res.ok) {
        setState({ status: "error", reply: data.error === "not_configured" ? labels.notConfigured : data.error === "rate_limited" ? labels.rateLimited : labels.error });
        return;
      }
      setState({ status: "done", reply: data.reply, id: data.conversationId });
    } catch {
      setState({ status: "error", reply: labels.error });
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <label htmlFor="ai-recipe" className="sr-only">{labels.label}</label>
      <Textarea id="ai-recipe" value={text} onChange={(e) => setText(e.target.value)} placeholder={labels.placeholder} maxLength={500} className="min-h-20" />
      <Button type="submit" variant="secondary" disabled={state.status === "loading" || !text.trim()}>
        <ChefHat className="h-4 w-4" aria-hidden />
        {state.status === "loading" ? labels.loading : labels.ask}
      </Button>
      <div aria-live="polite">
        {state.status === "error" && <Alert tone="warning">{state.reply}</Alert>}
        {state.status === "done" && (
          <div className="rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-800/60">
            <p className="whitespace-pre-line">{state.reply}</p>
            {state.id && <Link href={`/assistant?c=${state.id}`} className="mt-3 inline-block text-brand-700 underline dark:text-brand-400">{labels.open}</Link>}
          </div>
        )}
      </div>
      <p className="text-xs text-slate-500">{labels.disclaimer}</p>
    </form>
  );
}
