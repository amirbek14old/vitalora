import "server-only";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export async function audit(action: string, userId: string | null, target?: string, meta?: Prisma.InputJsonValue) {
  try {
    await db.auditLog.create({ data: { action, userId, target, meta } });
  } catch (err) {
    console.error("audit log failed", err);
  }
}

export async function logError(scope: string, err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`[${scope}]`, err);
  try {
    // Never log request bodies or health data — only the error message.
    await db.errorLog.create({ data: { scope, message: message.slice(0, 1000) } });
  } catch {
    /* ignore */
  }
}
