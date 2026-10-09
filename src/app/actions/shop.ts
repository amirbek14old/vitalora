"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertUser } from "@/lib/auth/guards";
import { equipItem, purchaseItem } from "@/lib/coins";
import { audit } from "@/lib/audit";
import { getI18n } from "@/lib/i18n/server";
import type { ActionState } from "@/lib/action-state";

const codeSchema = z.string().regex(/^[a-z0-9_]{2,40}$/);
const kindSchema = z.enum(["FRAME", "BANNER", "NAME_COLOR", "BADGE"]);

export async function buyItemAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await assertUser();
  const { t } = await getI18n();
  const code = codeSchema.safeParse(formData.get("code"));
  if (!code.success) return { error: t.common.errorGeneric };
  const res = await purchaseItem(user.id, code.data);
  if (!res.ok) {
    const map = { insufficient: t.shop.noMoney, need_pro: t.shop.needPro, owned: t.shop.owned, not_found: t.common.errorGeneric };
    return { error: map[res.error] };
  }
  await audit("shop.purchase", user.id, code.data);
  revalidatePath("/", "layout");
  return { ok: true, message: t.shop.bought };
}

export async function equipItemAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await assertUser();
  const { t } = await getI18n();
  const kind = kindSchema.safeParse(formData.get("kind"));
  const raw = formData.get("code");
  const code = raw ? codeSchema.safeParse(raw) : null;
  if (!kind.success || (code && !code.success)) return { error: t.common.errorGeneric };
  const ok = await equipItem(user.id, kind.data, code?.success ? code.data : null);
  if (!ok) return { error: t.common.errorGeneric };
  revalidatePath("/", "layout");
  return { ok: true };
}
