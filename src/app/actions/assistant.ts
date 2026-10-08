"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { assertUser } from "@/lib/auth/guards";

export async function deleteConversationAction(formData: FormData) {
  const user = await assertUser();
  await db.aIConversation.deleteMany({ where: { id: String(formData.get("id") ?? ""), userId: user.id } });
  revalidatePath("/assistant");
}
