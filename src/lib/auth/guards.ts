import "server-only";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { getCurrentUser, type CurrentUser } from "./session";

/** For pages: redirect to login if anonymous, to onboarding if not finished. */
export async function requireUser(opts: { allowIncompleteOnboarding?: boolean } = {}): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!opts.allowIncompleteOnboarding && !user.profile?.onboardingDone) redirect("/onboarding");
  return user;
}

export async function requireRole(roles: Role[]): Promise<CurrentUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect("/dashboard");
  return user;
}

export class AuthError extends Error {
  constructor(public status: 401 | 403) {
    super(status === 401 ? "Unauthorized" : "Forbidden");
  }
}

/** For server actions and route handlers: throw instead of redirecting. */
export async function assertUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new AuthError(401);
  return user;
}

export async function assertRole(roles: Role[]): Promise<CurrentUser> {
  const user = await assertUser();
  if (!roles.includes(user.role)) throw new AuthError(403);
  return user;
}

export function isTeen(user: CurrentUser): boolean {
  return user.profile?.ageGroup !== "ADULT";
}
