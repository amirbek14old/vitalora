import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { isSameOrigin } from "@/lib/request";
import { sniffImageType } from "@/lib/ai/food";
import { rateLimit } from "@/lib/rate-limit";
import { audit } from "@/lib/audit";

export const dynamic = "force-dynamic";
const MAX_AVATAR_BYTES = 256 * 1024;

/** Upload a profile photo (the browser already crops/resizes it to 256×256). */
export async function POST(req: Request) {
  if (!isSameOrigin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const rl = await rateLimit(`avatar:${user.id}`, 10, 3600);
  if (!rl.ok) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("image");
  if (!(file instanceof File)) return NextResponse.json({ error: "invalid" }, { status: 400 });
  if (file.size > MAX_AVATAR_BYTES) return NextResponse.json({ error: "too_large" }, { status: 413 });
  const bytes = new Uint8Array(await file.arrayBuffer());
  const mime = sniffImageType(bytes);
  if (!mime) return NextResponse.json({ error: "bad_type" }, { status: 415 });

  await db.avatar.upsert({
    where: { userId: user.id },
    update: { mime, data: Buffer.from(bytes) },
    create: { userId: user.id, mime, data: Buffer.from(bytes) },
  });
  await db.profile.updateMany({ where: { userId: user.id }, data: { avatarPreset: null } });
  await audit("profile.avatar_upload", user.id);
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  if (!isSameOrigin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  await db.avatar.deleteMany({ where: { userId: user.id } });
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
