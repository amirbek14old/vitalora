"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { assertUser, isTeen } from "@/lib/auth/guards";
import { postSchema, reportSchema } from "@/lib/validation";
import { needsReview } from "@/lib/moderation";
import { rateLimit, LIMITS } from "@/lib/rate-limit";
import { evaluateAchievements } from "@/lib/achievements";
import { audit } from "@/lib/audit";
import { getI18n } from "@/lib/i18n/server";
import type { ActionState } from "@/lib/action-state";

async function communitySlug(id: string) {
  return (await db.community.findUnique({ where: { id }, select: { slug: true } }))?.slug;
}

export async function toggleMembershipAction(formData: FormData) {
  const user = await assertUser();
  const communityId = String(formData.get("communityId") ?? "");
  const community = await db.community.findUnique({ where: { id: communityId } });
  if (!community) return;
  if (isTeen(user) && !community.teenSafe) return;
  const existing = await db.communityMember.findUnique({ where: { userId_communityId: { userId: user.id, communityId } } });
  if (existing) await db.communityMember.delete({ where: { id: existing.id } });
  else await db.communityMember.create({ data: { userId: user.id, communityId } });
  revalidatePath("/community");
  revalidatePath(`/community/${community.slug}`);
}

export async function createPostAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await assertUser();
  const { t } = await getI18n();
  const parsed = postSchema.safeParse({
    communityId: formData.get("communityId"),
    parentId: formData.get("parentId") || undefined,
    body: formData.get("body"),
  });
  if (!parsed.success) return { error: t.common.errorGeneric };
  const member = await db.communityMember.findUnique({ where: { userId_communityId: { userId: user.id, communityId: parsed.data.communityId } } });
  if (!member) return { error: t.community.joinToPost };
  const rl = await rateLimit(`post:${user.id}`, LIMITS.post.limit, LIMITS.post.window);
  if (!rl.ok) return { error: t.auth.tooManyAttempts };

  if (parsed.data.parentId) {
    const parent = await db.communityPost.findFirst({ where: { id: parsed.data.parentId, communityId: parsed.data.communityId, parentId: null } });
    if (!parent) return { error: t.common.errorGeneric };
  }
  const status = needsReview(parsed.data.body) ? "PENDING" : "VISIBLE";
  await db.communityPost.create({ data: { ...parsed.data, authorId: user.id, status } });
  await evaluateAchievements(user.id, ["community_voice"]);
  const slug = await communitySlug(parsed.data.communityId);
  if (slug) revalidatePath(`/community/${slug}`);
  return status === "PENDING" ? { ok: true, message: t.community.pending } : { ok: true };
}

export async function reportPostAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await assertUser();
  const { t } = await getI18n();
  const parsed = reportSchema.safeParse({ postId: formData.get("postId"), reason: formData.get("reason") });
  if (!parsed.success) return { error: t.common.errorGeneric };
  const rl = await rateLimit(`report:${user.id}`, LIMITS.report.limit, LIMITS.report.window);
  if (!rl.ok) return { error: t.auth.tooManyAttempts };
  await db.report.upsert({
    where: { postId_reporterId: { postId: parsed.data.postId, reporterId: user.id } },
    update: { reason: parsed.data.reason, status: "OPEN" },
    create: { ...parsed.data, reporterId: user.id },
  });
  await audit("community.report", user.id, parsed.data.postId);
  return { ok: true, message: t.community.reported };
}

export async function cheerPostAction(formData: FormData) {
  const user = await assertUser();
  const id = String(formData.get("postId") ?? "");
  // One cheer per user per post (tracked in the rate-limit table for a year).
  const once = await rateLimit(`cheer:${user.id}:${id}`, 1, 365 * 24 * 3600);
  if (!once.ok) return;
  const post = await db.communityPost.update({ where: { id }, data: { cheers: { increment: 1 } }, include: { community: true } }).catch(() => null);
  if (post) revalidatePath(`/community/${post.community.slug}`);
}

export async function deleteOwnPostAction(formData: FormData) {
  const user = await assertUser();
  const id = String(formData.get("postId") ?? "");
  const post = await db.communityPost.findFirst({ where: { id, authorId: user.id }, include: { community: true } });
  if (!post) return;
  await db.communityPost.delete({ where: { id } });
  revalidatePath(`/community/${post.community.slug}`);
}
