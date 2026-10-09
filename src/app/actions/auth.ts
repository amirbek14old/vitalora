"use server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { createSession, destroySession, getCurrentUser } from "@/lib/auth/session";
import { dummyVerify, hashPassword, verifyPassword } from "@/lib/auth/password";
import { loginSchema, registerSchema } from "@/lib/validation";
import { ageGroupFor } from "@/lib/age";
import { rateLimit, LIMITS } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request";
import { audit } from "@/lib/audit";
import { getI18n } from "@/lib/i18n/server";
import type { ActionState } from "@/lib/action-state";
import { safeNext } from "@/lib/safe-redirect";

export async function registerAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { t, locale } = await getI18n();
  const ip = await clientIp();
  const rl = await rateLimit(`register:${ip}`, LIMITS.register.limit, LIMITS.register.window);
  if (!rl.ok) return { error: t.auth.tooManyAttempts };

  if (formData.get("acceptTerms") !== "on") return { error: t.auth.mustAccept };
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const field = parsed.error.issues[0]?.path[0];
    if (field === "password") return { error: t.auth.passwordHint };
    if (field === "birthYear") return { error: t.auth.birthYearHint };
    if (field === "displayName") return { error: t.auth.displayNameHint };
    return { error: t.common.errorGeneric };
  }
  const { email, password, displayName, birthYear } = parsed.data;
  const ageGroup = ageGroupFor(birthYear);
  if (ageGroup === "TOO_YOUNG") return { error: t.auth.tooYoung };

  const exists = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (exists) return { error: t.auth.emailTaken };

  const user = await db.user.create({
    data: {
      email,
      passwordHash: await hashPassword(password),
      profile: { create: { displayName, birthYear, ageGroup } },
      // Privacy by design: every consent defaults to off; teens never get community visibility by default.
      preference: { create: { locale } },
    },
  });
  await audit("auth.register", user.id);
  await createSession(user.id);
  redirect("/onboarding");
}

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { t } = await getI18n();
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: t.auth.invalidCredentials };
  const { email, password } = parsed.data;

  const ip = await clientIp();
  const [byIp, byEmail] = await Promise.all([
    rateLimit(`login:ip:${ip}`, LIMITS.login.limit * 3, LIMITS.login.window),
    rateLimit(`login:email:${email}`, LIMITS.login.limit, LIMITS.login.window),
  ]);
  if (!byIp.ok || !byEmail.ok) return { error: t.auth.tooManyAttempts };

  const user = await db.user.findUnique({ where: { email }, include: { profile: true } });
  const valid = user ? await verifyPassword(password, user.passwordHash) : await dummyVerify(password);
  if (!user || !valid) {
    await audit("auth.login_failed", user?.id ?? null);
    return { error: t.auth.invalidCredentials };
  }
  await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await audit("auth.login", user.id);
  await createSession(user.id);
  redirect(user.profile?.onboardingDone ? safeNext(formData.get("next")) : "/onboarding");
}

export async function logoutAction() {
  const user = await getCurrentUser();
  if (user) await audit("auth.logout", user.id);
  await destroySession();
  redirect("/");
}
