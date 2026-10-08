import { AIProviderError, type AIProvider, type CompletionRequest } from "../types";

type Config = { apiKey: string; model: string; visionModel: string; baseUrl?: string };

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

    const res = await fetch(`${this.cfg.baseUrl ?? "https://api.openai.com/v1"}/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${this.cfg.apiKey}` },
      body: JSON.stringify({
        model: req.vision || req.image ? this.cfg.visionModel : this.cfg.model,
        max_tokens: req.maxTokens ?? 800,
        messages,
      }),
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) throw new AIProviderError(`OpenAI-compatible API error ${res.status}`, res.status);
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return data.choices?.[0]?.message?.content?.trim() ?? "";
  }
}
