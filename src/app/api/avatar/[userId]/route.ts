import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

/** Serves a profile photo. Visible to the owner, staff, and — if the owner chose to be visible — other members. */
export async function GET(_req: Request, { params }: { params: Promise<{ userId: string }> }) {
  const viewer = await getCurrentUser();
  if (!viewer) return new NextResponse(null, { status: 401 });
  const { userId } = await params;
  const avatar = await db.avatar.findUnique({
    where: { userId },
    include: { user: { select: { preference: { select: { communityVisible: true } } } } },
  });
  if (!avatar) return new NextResponse(null, { status: 404 });
  const allowed = viewer.id === userId || viewer.role !== "USER" || avatar.user.preference?.communityVisible;
  if (!allowed) return new NextResponse(null, { status: 404 });
  return new NextResponse(new Uint8Array(avatar.data), {
    headers: {
      "content-type": avatar.mime,
      "cache-control": "private, max-age=86400",
      "x-content-type-options": "nosniff",
    },
  });
}
