import { createHash, randomBytes } from "node:crypto";

export function newSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

/** Only the SHA-256 of a session token is stored, so a DB leak doesn't expose live sessions. */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
