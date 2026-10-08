import bcrypt from "bcryptjs";

const COST = 12;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, COST);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

let dummyHash: Promise<string> | null = null;
/** Run a comparison anyway when the email is unknown, so response time doesn't reveal which emails exist. */
export async function dummyVerify(plain: string): Promise<false> {
  dummyHash ??= bcrypt.hash("vitalora-dummy-password", COST);
  await bcrypt.compare(plain, await dummyHash);
  return false;
}
