import "server-only";
import { db } from "@/lib/db";

export type RateLimitResult = { ok: boolean; remaining: number; resetAt: Date };

/**
 * Fixed-window rate limiter persisted in Postgres (works across serverless instances).
 * Uses a single atomic upsert statement.
 */
// Optional multiplier for load/e2e testing environments (default 1). Never set it in production.
const MULTIPLIER = Math.max(1, Number(process.env.RATE_LIMIT_MULTIPLIER ?? 1) || 1);

export async function rateLimit(key: string, baseLimit: number, windowSeconds: number): Promise<RateLimitResult> {
  const limit = baseLimit * MULTIPLIER;
  const rows = await db.$queryRaw<{ count: number; windowEnd: Date }[]>`
    INSERT INTO "RateLimitBucket" ("key", "count", "windowEnd")
    VALUES (${key}::text, 1, NOW() + (${windowSeconds}::int * INTERVAL '1 second'))
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "RateLimitBucket"."windowEnd" < NOW() THEN 1 ELSE "RateLimitBucket"."count" + 1 END,
      "windowEnd" = CASE WHEN "RateLimitBucket"."windowEnd" < NOW() THEN NOW() + (${windowSeconds}::int * INTERVAL '1 second') ELSE "RateLimitBucket"."windowEnd" END
    RETURNING "count"::int AS "count", "windowEnd"`;
  const row = rows[0];
  return { ok: row.count <= limit, remaining: Math.max(0, limit - row.count), resetAt: row.windowEnd };
}

export const LIMITS = {
  login: { limit: 10, window: 15 * 60 },
  register: { limit: 20, window: 60 * 60 }, // per IP; schools and families often share one IP
  aiChat: { limit: 30, window: 60 * 60 },
  foodScan: { limit: 15, window: 60 * 60 },
  post: { limit: 20, window: 60 * 60 },
  report: { limit: 20, window: 60 * 60 },
} as const;
