import { AIProviderError, type AIProvider, type CompletionRequest } from "../types";

type Config = { apiKey: string; model: string; visionModel: string; baseUrl?: string; reasoningEffort?: string; visionReasoningEffort?: string };

/** Works with OpenAI and other providers exposing an OpenAI-compatible /chat/completions API. */
export class OpenAICompatibleProvider implements AIProvider {
  readonly name = "openai";
  constructor(private cfg: Config) {}

  async complete(req: CompletionRequest): Promise<string> {
    const messages: unknown[] = [{ role: "system", content: req.system }];
    req.messages.forEach((m, i) => {
      const isLast = i === req.messages.length - 1;
      if (isLast && req.image && m.role === "user") {
        messages.push({
          role: "user",
          content: [
            { type: "text", text: m.content },
            { type: "image_url", image_url: { url: `data:${req.image.mediaType};base64,${req.image.base64}` } },
          ],
        });
      } else {
        messages.push({ role: m.role, content: m.content });
      }
    });

    const base = (this.cfg.baseUrl ?? "https://api.openai.com/v1").replace(/\/+$/, "");
    const body: Record<string, unknown> = {
      model: req.vision || req.image ? this.cfg.visionModel : this.cfg.model,
      max_tokens: req.maxTokens ?? 800,
      messages,
    };
    const effort = req.image ? this.cfg.visionReasoningEffort ?? this.cfg.reasoningEffort : this.cfg.reasoningEffort;
    const extras: Record<string, unknown> = {
      ...(effort ? { reasoning_effort: effort } : {}),
      ...(req.json ? { response_format: { type: "json_object" } } : {}),
    };
    const send = (b: Record<string, unknown>) =>
      fetch(`${base}/chat/completions`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${this.cfg.apiKey}` },
        body: JSON.stringify(b),
        signal: AbortSignal.timeout(55_000),
      });

    let res = await send({ ...body, ...extras });
    // Some models reject optional parameters (reasoning_effort / JSON mode) — retry once without them.
    if (res.status === 400 && Object.keys(extras).length) {
      const detail = (await res.text().catch(() => "")).slice(0, 300);
      console.error(`[ai] 400 with optional params, retrying without them: ${detail}`);
      res = await send(body);
    }
    if (!res.ok) {
      // Log the provider's reason (never the key) so problems are visible in Vercel → Logs.
      const detail = (await res.text().catch(() => "")).slice(0, 300);
      console.error(`[ai] ${this.cfg.baseUrl ?? "openai"} → ${res.status}: ${detail}`);
      throw new AIProviderError(`OpenAI-compatible API error ${res.status}`, res.status);
    }
    const data = (await res.json()) as { choices?: { message?: { content?: string | null }; finish_reason?: string }[] };
    const text = data.choices?.[0]?.message?.content?.trim() ?? "";
    if (!text) console.error(`[ai] empty answer (finish_reason: ${data.choices?.[0]?.finish_reason ?? "?"})`);
    return text;
  }
}
