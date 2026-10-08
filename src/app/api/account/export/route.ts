import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { audit } from "@/lib/audit";

export const dynamic = "force-dynamic";

/** GDPR-style data export: everything linked to the account, without secrets (password/session hashes). */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const data = await db.user.findUnique({
    where: { id: user.id },
    select: {
      email: true, role: true, createdAt: true, lastLoginAt: true,
      profile: true, preference: true,
      workoutSessions: { include: { logs: { include: { exercise: { select: { slug: true } } } } } },
      sleepLogs: true, mealLogs: true,
      habits: { include: { entries: true } },
      lessonProgress: true, quizAttempts: true,
      achievements: { include: { achievement: { select: { code: true } } } },
      memberships: { include: { community: { select: { slug: true } } } },
      posts: true, reports: true,
      aiConversations: { include: { messages: true } },
      notifications: true,
    },
  });
  await audit("account.export", user.id);
  return new NextResponse(JSON.stringify({ exportedAt: new Date().toISOString(), account: data }, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="vitalora-export-${new Date().toISOString().slice(0, 10)}.json"`,
      "cache-control": "no-store",
    },
  });
}
