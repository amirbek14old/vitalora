"use client";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export function AIInsight({ labels }: { labels: { button: string; loading: string; error: string; notConfigured: string; rateLimited: string; disclaimer: string } }) {
  const [state, setState] = useState<{ status: "idle" | "loading" | "done" | "error"; text?: string }>({ status: "idle" });

  async function run() {
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mode: "insight", message: "Give me one educational insight about my week." }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.error === "not_configured" ? labels.notConfigured : data.error === "rate_limited" ? labels.rateLimited : labels.error;
        setState({ status: "error", text: msg });
        return;
      }
      setState({ status: "done", text: data.reply });
    } catch {
      setState({ status: "error", text: labels.error });
    }
  }

  return (
    <div className="space-y-3" aria-live="polite">
      {state.status === "done" && <p className="whitespace-pre-line text-sm text-slate-700 dark:text-slate-200">{state.text}</p>}
      {state.status === "error" && <Alert tone="warning">{state.text}</Alert>}
      <Button variant="secondary" size="sm" onClick={run} disabled={state.status === "loading"}>
        <Sparkles className="h-4 w-4" aria-hidden />
        {state.status === "loading" ? labels.loading : labels.button}
      </Button>
      <p className="text-xs text-slate-500">{labels.disclaimer}</p>
    </div>
  );
}
