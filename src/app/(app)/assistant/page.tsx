import Link from "next/link";
import { MessageSquarePlus, ShieldAlert, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { getI18n } from "@/lib/i18n/server";
import { isAIConfigured } from "@/lib/ai/provider";
import { deleteConversationAction } from "@/app/actions/assistant";
import { PageHeader } from "@/components/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button";
import { Chat } from "@/components/assistant/chat";
import { cn } from "@/lib/utils";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.assistant.title };
}

export default async function AssistantPage({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const user = await requireUser();
  const { t } = await getI18n();
  const { c } = await searchParams;

  if (!user.preference?.aiConsent) {
    return (
      <div className="space-y-6">
        <PageHeader title={t.assistant.title} subtitle={t.assistant.subtitle} />
        <Card className="max-w-xl">
          <CardTitle>{t.assistant.consentTitle}</CardTitle>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{t.assistant.consentText}</p>
          <ButtonLink href="/settings" className="mt-4">{t.assistant.goSettings}</ButtonLink>
        </Card>
      </div>
    );
  }

  const conversations = await db.aIConversation.findMany({ where: { userId: user.id }, orderBy: { updatedAt: "desc" }, take: 30, select: { id: true, title: true } });
  const active = c ? await db.aIConversation.findFirst({ where: { id: c, userId: user.id }, include: { messages: { orderBy: { createdAt: "asc" } } } }) : null;

  return (
    <div className="space-y-6">
      <PageHeader title={t.assistant.title} subtitle={t.assistant.subtitle} actions={<ButtonLink href="/assistant" variant="secondary"><MessageSquarePlus className="h-4 w-4" aria-hidden />{t.assistant.newChat}</ButtonLink>} />
      {!isAIConfigured() && <Alert tone="warning">{t.assistant.notConfigured}</Alert>}
      <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
        <Card className="h-fit p-3">
          <h2 className="px-2 pb-2 text-sm font-semibold text-slate-500">{t.assistant.history}</h2>
          <ul className="space-y-1">
            {conversations.map((conv) => (
              <li key={conv.id} className="group flex items-center gap-1">
                <Link href={`/assistant?c=${conv.id}`} aria-current={conv.id === active?.id ? "page" : undefined} className={cn("flex-1 truncate rounded-lg px-2 py-1.5 text-sm", conv.id === active?.id ? "bg-brand-50 font-medium dark:bg-brand-900/40" : "hover:bg-slate-100 dark:hover:bg-slate-800")}>
                  {conv.title}
                </Link>
                <form action={deleteConversationAction}>
                  <input type="hidden" name="id" value={conv.id} />
                  <button type="submit" className="rounded p-1 text-slate-400 hover:text-red-600" aria-label={`${t.assistant.deleteChat}: ${conv.title}`}><Trash2 className="h-3.5 w-3.5" aria-hidden /></button>
                </form>
              </li>
            ))}
          </ul>
        </Card>
        <div className="space-y-3">
          <Alert tone="info"><span className="inline-flex items-start gap-1"><ShieldAlert className="sr-only" aria-hidden />{t.assistant.limitations}</span></Alert>
          <Card>
            <Chat
              key={active?.id ?? "new"}
              conversationId={active?.id}
              initialMessages={(active?.messages ?? []).map((m) => ({ id: m.id, role: m.role === "assistant" ? "assistant" : "user", content: m.content, flagged: m.flagged }))}
              labels={{ label: t.assistant.title, placeholder: t.assistant.placeholder, send: t.assistant.send, thinking: t.assistant.thinking, error: t.common.errorGeneric, notConfigured: t.assistant.notConfigured, rateLimited: t.assistant.rateLimited, suggestions: t.assistant.suggestions }}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
