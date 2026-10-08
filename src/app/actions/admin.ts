"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { assertRole } from "@/lib/auth/guards";
import { audit } from "@/lib/audit";
import { slugify } from "@/lib/utils";
import { getI18n } from "@/lib/i18n/server";
import type { ActionState } from "@/lib/action-state";

const STAFF = ["ADMIN", "MODERATOR"] as const;

export async function toggleExercisePublishAction(formData: FormData) {
  const admin = await assertRole(["ADMIN"]);
  const id = String(formData.get("id") ?? "");
  const ex = await db.exercise.findUnique({ where: { id } });
  if (!ex) return;
  await db.exercise.update({ where: { id }, data: { published: !ex.published } });
  await audit("admin.exercise_publish", admin.id, id, { published: !ex.published });
  revalidatePath("/admin");
}

export async function markExerciseReviewedAction(formData: FormData) {
  const admin = await assertRole(["ADMIN"]);
  const id = String(formData.get("id") ?? "");
  await db.exercise.update({ where: { id }, data: { reviewed: true } });
  await audit("admin.exercise_reviewed", admin.id, id);
  revalidatePath("/admin");
}

export async function toggleRecipePublishAction(formData: FormData) {
  const admin = await assertRole(["ADMIN"]);
  const id = String(formData.get("id") ?? "");
  const r = await db.recipe.findUnique({ where: { id } });
  if (!r) return;
  await db.recipe.update({ where: { id }, data: { published: !r.published } });
  await audit("admin.recipe_publish", admin.id, id, { published: !r.published });
  revalidatePath("/admin");
}

export async function toggleCoursePublishAction(formData: FormData) {
  const admin = await assertRole(["ADMIN"]);
  const id = String(formData.get("id") ?? "");
  const c = await db.course.findUnique({ where: { id } });
  if (!c) return;
  await db.course.update({ where: { id }, data: { published: !c.published } });
  await audit("admin.course_publish", admin.id, id, { published: !c.published });
  revalidatePath("/admin");
}

export async function moderatePostAction(formData: FormData) {
  const mod = await assertRole([...STAFF]);
  const postId = String(formData.get("postId") ?? "");
  const decision = String(formData.get("decision") ?? "");
  if (!["hide", "restore", "dismiss"].includes(decision)) return;
  await db.$transaction(async (tx) => {
    if (decision === "hide") await tx.communityPost.update({ where: { id: postId }, data: { status: "HIDDEN" } });
    if (decision === "restore") await tx.communityPost.update({ where: { id: postId }, data: { status: "VISIBLE" } });
    await tx.report.updateMany({
      where: { postId, status: "OPEN" },
      data: { status: decision === "hide" ? "RESOLVED" : "DISMISSED", resolvedAt: new Date() },
    });
  });
  if (decision === "hide") {
    const post = await db.communityPost.findUnique({ where: { id: postId }, select: { authorId: true } });
    if (post) await db.notification.create({ data: { userId: post.authorId, kind: "moderation", title: "moderation.hidden" } });
  }
  await audit(`moderation.${decision}`, mod.id, postId);
  revalidatePath("/admin");
}

export async function changeRoleAction(formData: FormData) {
  const admin = await assertRole(["ADMIN"]);
  const userId = String(formData.get("userId") ?? "");
  const role = z.enum(["USER", "MODERATOR", "ADMIN"]).safeParse(formData.get("role"));
  if (!role.success || userId === admin.id) return; // admins can't demote themselves (prevents lock-out)
  await db.user.update({ where: { id: userId }, data: { role: role.data } });
  await audit("admin.role_change", admin.id, userId, { role: role.data });
  revalidatePath("/admin");
}

const lines = (v: FormDataEntryValue | null) => String(v ?? "").split("\n").map((s) => s.trim()).filter(Boolean);
const text = (v: FormDataEntryValue | null) => String(v ?? "").trim();

const localized = z.object({ uz: z.string().min(1).max(200), en: z.string().min(1).max(200), ru: z.string().min(1).max(200) });

export async function createRecipeAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await assertRole(["ADMIN"]);
  const { t } = await getI18n();
  const title = localized.safeParse({ uz: text(formData.get("title_uz")), en: text(formData.get("title_en")), ru: text(formData.get("title_ru")) });
  if (!title.success) return { error: t.common.errorGeneric };
  const cuisine = formData.get("cuisine") === "uzbek" ? "uzbek" : "international";
  const prepMin = Number(formData.get("prepMin"));
  const servings = Number(formData.get("servings"));
  if (!Number.isInteger(prepMin) || prepMin < 1 || prepMin > 600 || !Number.isInteger(servings) || servings < 1 || servings > 50) return { error: t.common.errorGeneric };
  const by = (k: string) => ({ uz: lines(formData.get(`${k}_uz`)), en: lines(formData.get(`${k}_en`)), ru: lines(formData.get(`${k}_ru`)) });
  const ingredients = by("ingredients");
  const steps = by("steps");
  if (!ingredients.en.length || !steps.en.length) return { error: t.common.errorGeneric };
  const slugBase = slugify(title.data.en) || "recipe";
  const slug = (await db.recipe.findUnique({ where: { slug: slugBase } })) ? `${slugBase}-${Date.now().toString(36)}` : slugBase;
  const desc = { uz: text(formData.get("desc_uz")), en: text(formData.get("desc_en")), ru: text(formData.get("desc_ru")) };
  await db.recipe.create({
    data: {
      slug, title: title.data, description: desc, ingredients, steps, cuisine, prepMin, servings,
      foodGroups: lines(formData.get("foodGroups")).slice(0, 8),
      allergens: lines(formData.get("allergens")).slice(0, 10),
      published: false, // new content starts as a draft for review
    },
  });
  await audit("admin.recipe_create", admin.id, slug);
  revalidatePath("/admin");
  return { ok: true, message: t.settings.saved };
}
