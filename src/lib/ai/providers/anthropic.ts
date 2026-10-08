import { AIProviderError, type AIProvider, type CompletionRequest } from "../types";

type Config = { apiKey: string; model: string; visionModel: string; baseUrl?: string };

export class AnthropicProvider implements AIProvider {
  readonly name = "anthropic";
  constructor(private cfg: Config) {}

  async complete(req: CompletionRequest): Promise<string> {
    const messages = req.messages.map((m, i) => {
      const isLast = i === req.messages.length - 1;
      if (isLast && req.image && m.role === "user") {
        return {
          role: m.role,
          content: [
            { type: "image", source: { type: "base64", media_type: req.image.mediaType, data: req.image.base64 } },
            { type: "text", text: m.content },
          ],
        };
      }
      return { role: m.role, content: m.content };
    });

    const res = await fetch(`${this.cfg.baseUrl ?? "https://api.anthropic.com"}/v1/messages`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": this.cfg.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: req.vision || req.image ? this.cfg.visionModel : this.cfg.model,
        max_tokens: req.maxTokens ?? 800,
        system: req.system,
        messages,
      }),
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) throw new AIProviderError(`Anthropic API error ${res.status}`, res.status);
    const data = (await res.json()) as { content?: { type: string; text?: string }[] };
    return (data.content ?? []).filter((c) => c.type === "text").map((c) => c.text ?? "").join("\n").trim();
  }
}
