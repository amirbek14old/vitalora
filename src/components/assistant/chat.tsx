"use client";
import { aiErrorText, type AIErrorLabels } from "@/lib/ai-error-text";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/form";
import { Alert } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

export type ChatMessageView = { id: string; role: "user" | "assistant"; content: string; flagged?: string | null };

type Labels = AIErrorLabels & { placeholder: string; send: string; thinking: string; suggestions: string[]; label: string };

export function Chat({ conversationId: initialId, initialMessages, labels }: { conversationId?: string; initialMessages: ChatMessageView[]; labels: Labels }) {
  const router = useRouter();
  const [conversationId, setConversationId] = useState(initialId);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), [messages, pending]);

  async function send(text: string) {
    const message = text.trim();
    if (!message || pending) return;
    setError("");
    setInput("");
    setMessages((m) => [...m, { id: `tmp-${Date.now()}`, role: "user", content: message }]);
    setPending(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message, conversationId, mode: "chat" }),
      });
      const data = await res.json().catch(() => ({}));
      // Keep the conversation id in state (no navigation → no remount, so typed text is never lost).
      if (data.conversationId && !conversationId) setConversationId(data.conversationId);
      if (!res.ok) {
        setError(aiErrorText(data, labels));
        return;
      }
      setMessages((m) => [...m, { id: `a-${Date.now()}`, role: "assistant", content: data.reply, flagged: data.flagged }]);
      router.refresh();
    } catch {
      setError(labels.error);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex h-[65vh] min-h-[28rem] flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto p-1" role="log" aria-live="polite" aria-label={labels.label}>
        {messages.length === 0 && (
          <div className="grid gap-2 sm:grid-cols-2">
            {labels.suggestions.map((s) => (
              <button key={s} type="button" onClick={() => send(s)} className="rounded-xl border border-slate-200 p-3 text-left text-sm hover:border-brand-500 dark:border-slate-700">
                {s}
              </button>
            ))}
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={cn("flex gap-3", m.role === "user" && "flex-row-reverse")}>
            <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", m.role === "user" ? "bg-slate-200 dark:bg-slate-700" : "bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-100")}>
              {m.role === "user" ? <User className="h-4 w-4" aria-hidden /> : <Bot className="h-4 w-4" aria-hidden />}
            </span>
            <div className={cn("max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm", m.role === "user" ? "bg-brand-700 text-white dark:bg-brand-600" : "bg-white shadow-sm dark:bg-slate-800", m.flagged && m.role === "assistant" && "border-l-4 border-amber-500")}>
              {m.content}
            </div>
          </div>
        ))}
        {pending && <p className="text-sm text-slate-500">{labels.thinking}</p>}
        <div ref={endRef} />
      </div>
      {error && <Alert tone="warning" className="mb-2">{error}</Alert>}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="mt-3 flex items-end gap-2"
      >
        <label htmlFor="chat-input" className="sr-only">{labels.placeholder}</label>
        <Textarea
          id="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          placeholder={labels.placeholder}
          maxLength={2000}
          rows={2}
          className="min-h-12 flex-1 resize-none"
        />
        <Button type="submit" disabled={pending || !input.trim()} aria-label={labels.send}>
          <Send className="h-4 w-4" aria-hidden />
        </Button>
      </form>
    </div>
  );
}
