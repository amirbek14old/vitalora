import "server-only";
import { AnthropicProvider } from "./providers/anthropic";
import { OpenAICompatibleProvider } from "./providers/openai-compatible";
import { AINotConfiguredError, type AIProvider } from "./types";

/**
 * Provider-independent factory. API keys are read from server-side environment variables only
 * and are never sent to the browser (this module imports "server-only").
 */
export function getAIProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER?.trim();
  const apiKey = process.env.AI_API_KEY?.trim();
  const model = process.env.AI_MODEL?.trim();
  if (!provider || !apiKey || !model) throw new AINotConfiguredError();
  const isGemini = provider === "gemini";
  const cfg = {
    apiKey,
    model,
    visionModel: process.env.AI_VISION_MODEL?.trim() || model,
    // Google Gemini exposes an OpenAI-compatible API (free tier available, no card needed).
    baseUrl: process.env.AI_BASE_URL?.trim() || (isGemini ? "https://generativelanguage.googleapis.com/v1beta/openai" : undefined),
    // Gemini 2.5 Flash "thinks" by default and spends the answer budget on it — turn that off for fast, complete answers.
    reasoningEffort: process.env.AI_REASONING_EFFORT?.trim() || (isGemini && /2\.5-flash/.test(model) ? "none" : undefined),
    // Photos are harder: let Gemini think a little for better food recognition.
    visionReasoningEffort: process.env.AI_VISION_REASONING_EFFORT?.trim() || (isGemini ? "low" : undefined),
  };
  switch (provider) {
    case "anthropic":
      return new AnthropicProvider(cfg);
    case "openai":
    case "gemini":
      return new OpenAICompatibleProvider(cfg);
    default:
      throw new AINotConfiguredError();
  }
}

export function isAIConfigured(): boolean {
  try {
    getAIProvider();
    return true;
  } catch {
    return false;
  }
}
