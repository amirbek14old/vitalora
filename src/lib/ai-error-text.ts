/** Turns an AI route error response into a helpful message (client-safe, no secrets). */
export type AIErrorLabels = {
  error: string;
  notConfigured: string;
  rateLimited: string;
  aiErrors: { quota: string; key: string; model: string; other: string };
};

export function aiErrorText(data: { error?: string; status?: number } | null | undefined, l: AIErrorLabels, extra: Record<string, string> = {}): string {
  const e = data?.error ?? "";
  if (extra[e]) return extra[e];
  if (e === "not_configured") return l.notConfigured;
  if (e === "rate_limited") return l.rateLimited;
  if (e === "provider_error") {
    const s = data?.status ?? 0;
    if (s === 429) return l.aiErrors.quota;
    if (s === 401 || s === 403) return l.aiErrors.key;
    if (s === 404) return l.aiErrors.model;
    if (s) return l.aiErrors.other.replace("{code}", String(s));
  }
  return l.error;
}
