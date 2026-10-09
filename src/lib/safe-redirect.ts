/** Only allow same-site relative paths (prevents open-redirects like "//evil.com" or "https://…"). */
export function safeNext(next: unknown, fallback = "/dashboard"): string {
  if (typeof next !== "string" || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  if (next.startsWith("/login") || next.startsWith("/register")) return fallback;
  return next.slice(0, 300);
}
