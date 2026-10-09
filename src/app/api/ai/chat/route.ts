import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { isTeen } from "@/lib/auth/guards";
import { chatSchema } from "@/lib/validation";
import { rateLimit, LIMITS } from "@/lib/rate-limit";
import { isSameOrigin } from "@/lib/request";
import { getAIProvider } from "@/lib/ai/provider";
import { AINotConfiguredError } from "@/lib/ai/types";
import { buildSystemPrompt } from "@/lib/ai/prompts";
import { classifyInput, guardOutput, isBlockingCategory, safeResponse } from "@/lib/ai/safety";
import { getWeeklyStats, summariseForAI } from "@/lib/stats";
import { logError } from "@/lib/audit";
import { getLocale } from "@/lib/i18n/server";
import { isPro } from "@/lib/coins";
import { PRO_LIMIT_MULTIPLIER } from "@/lib/coin-rules";

export const dynamic = "force-dynamic";
const HISTORY_LIMIT = 12;

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!user.preference?.aiConsent) return NextResponse.json({ error: "consent_required" }, { status: 403 });

  const parsed = chatSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const { message, mode } = parsed.data;

  const rl = await rateLimit(`ai:${user.id}`, LIMITS.aiChat.limit * (isPro(user) ? PRO_LIMIT_MULTIPLIER : 1), LIMITS.aiChat.window);
  if (!rl.ok) return NextResponse.json({ error: "rate_limited", resetAt: rl.resetAt }, { status: 429 });

  const locale = await getLocale();
  const teen = isTeen(user);

  // Insight and form modes are stateless; chat/recipe modes are stored as conversations.
  let conversationId = parsed.data.conversationId;
  const stateless = mode === "insight" || mode === "form";
  if (!stateless) {
    if (conversationId) {
      const owned = await db.aIConversation.findFirst({ where: { id: conversationId, userId: user.id }, select: { id: true } });
      if (!owned) return NextResponse.json({ error: "not_found" }, { status: 404 });
    } else {
      const created = await db.aIConversation.create({ data: { userId: user.id, title: message.slice(0, 80) } });
      conversationId = created.id;
    }
    await db.aIMessage.create({ data: { conversationId, role: "user", content: message } });
  }

  // 1) Deterministic input guardrails — crisis, emergencies and disordered eating never reach the model.
  const category = classifyInput(message);
  if (isBlockingCategory(category)) {
    const reply = safeResponse(category, locale);
    if (conversationId && !stateless) {
      await db.aIMessage.create({ data: { conversationId, role: "assistant", content: reply, flagged: category } });
    }
    return NextResponse.json({ conversationId, reply, flagged: category });
  }

  let provider;
  try {
    provider = getAIProvider();
  } catch (e) {
    if (e instanceof AINotConfiguredError) return NextResponse.json({ error: "not_configured", conversationId }, { status: 503 });
    throw e;
  }

  // 2) Personalisation only with explicit consent, and only aggregated numbers.
  let activitySummary: string | undefined;
  if (user.preference.aiPersonalizationConsent) {
    const { snapshot } = await getWeeklyStats(user.id);
    activitySummary = summariseForAI(snapshot);
  }

  const history =
    conversationId && !stateless
      ? (await db.aIMessage.findMany({ where: { conversationId }, orderBy: { createdAt: "desc" }, take: HISTORY_LIMIT })).reverse()
      : [{ role: "user", content: message }];

  try {
    const raw = await provider.complete({
      system: buildSystemPrompt({ locale, teen, mode, activitySummary }),
      messages: history.map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content })),
      maxTokens: stateless ? 300 : 900,
    });
    // 3) Output guardrails.
    const { text, flagged } = guardOutput(raw || "", { locale, teen });
    const reply = text || "…";
    if (conversationId && !stateless) {
      await db.aIMessage.create({ data: { conversationId, role: "assistant", content: reply, flagged: flagged ?? (category === "medication" ? "medication" : null) } });
      await db.aIConversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } });
    }
    return NextResponse.json({ conversationId, reply, flagged });
  } catch (err) {
    await logError("ai.chat", err);
    return NextResponse.json({ error: "provider_error", conversationId }, { status: 502 });
  }
}
