import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { isTeen } from "@/lib/auth/guards";
import { rateLimit, LIMITS } from "@/lib/rate-limit";
import { isSameOrigin } from "@/lib/request";
import { getAIProvider } from "@/lib/ai/provider";
import { AINotConfiguredError, AIProviderError } from "@/lib/ai/types";
import { buildFoodVisionPrompt } from "@/lib/ai/prompts";
import { MAX_IMAGE_BYTES, parseFoodAnalysis, sniffImageType, stripNumbers } from "@/lib/ai/food";
import { logError } from "@/lib/audit";
import { getLocale } from "@/lib/i18n/server";
import { isPro } from "@/lib/coins";
import { PRO_LIMIT_MULTIPLIER } from "@/lib/coin-rules";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // vision models can take a while

/**
 * Food photo → estimated foods, portions, energy and macros.
 * The image is processed in memory and forwarded to the AI provider only; it is never stored.
 */
export async function POST(req: Request) {
  if (!isSameOrigin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!user.preference?.aiConsent) return NextResponse.json({ error: "consent_required" }, { status: 403 });

  const rl = await rateLimit(`food:${user.id}`, LIMITS.foodScan.limit * (isPro(user) ? PRO_LIMIT_MULTIPLIER : 1), LIMITS.foodScan.window);
  if (!rl.ok) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("image");
  if (!(file instanceof File)) return NextResponse.json({ error: "invalid" }, { status: 400 });
  if (file.size > MAX_IMAGE_BYTES) return NextResponse.json({ error: "too_large" }, { status: 413 });

  const bytes = new Uint8Array(await file.arrayBuffer());
  const mediaType = sniffImageType(bytes);
  if (!mediaType) return NextResponse.json({ error: "bad_type" }, { status: 415 });

  let provider;
  try {
    provider = getAIProvider();
  } catch (e) {
    if (e instanceof AINotConfiguredError) return NextResponse.json({ error: "not_configured" }, { status: 503 });
    throw e;
  }

  const locale = await getLocale();
  try {
    const raw = await provider.complete({
      system: buildFoodVisionPrompt(locale),
      messages: [{ role: "user", content: "Analyse this meal photo and return the JSON object." }],
      image: { mediaType, base64: Buffer.from(bytes).toString("base64") },
      maxTokens: 2000,
      json: true,
    });
    const analysis = parseFoodAnalysis(raw);
    if (!analysis.isFood || analysis.items.length === 0) return NextResponse.json({ error: "not_food" }, { status: 422 });
    // Teen accounts never receive calorie or macro numbers.
    return NextResponse.json({ analysis: isTeen(user) ? stripNumbers(analysis) : analysis, teen: isTeen(user) });
  } catch (err) {
    await logError("ai.food_scan", err);
    console.error("[ai] food scan failed:", err instanceof Error ? err.message : err);
    const status = err instanceof AIProviderError ? err.status ?? 0 : 0;
    return NextResponse.json({ error: "provider_error", status }, { status: 502 });
  }
}
