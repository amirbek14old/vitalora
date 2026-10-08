import type { PrismaClient } from "@prisma/client";

/** Retention policy (documented in docs/06-security-privacy.md). */
export const RETENTION = {
  aiConversationsDays: 90,
  readNotificationsDays: 60,
  auditLogDays: 365,
  errorLogDays: 30,
} as const;

const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

export async function runRetention(db: PrismaClient) {
  const [sessions, conversations, notifications, audit, errors, buckets] = await Promise.all([
    db.session.deleteMany({ where: { expiresAt: { lt: new Date() } } }),
    db.aIConversation.deleteMany({ where: { updatedAt: { lt: daysAgo(RETENTION.aiConversationsDays) } } }),
    db.notification.deleteMany({ where: { read: true, createdAt: { lt: daysAgo(RETENTION.readNotificationsDays) } } }),
    db.auditLog.deleteMany({ where: { createdAt: { lt: daysAgo(RETENTION.auditLogDays) } } }),
    db.errorLog.deleteMany({ where: { createdAt: { lt: daysAgo(RETENTION.errorLogDays) } } }),
    db.rateLimitBucket.deleteMany({ where: { windowEnd: { lt: new Date() } } }),
  ]);
  return {
    sessions: sessions.count,
    conversations: conversations.count,
    notifications: notifications.count,
    audit: audit.count,
    errors: errors.count,
    buckets: buckets.count,
  };
}
