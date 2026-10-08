/**
 * Age handling. We only store the birth year (data minimisation), so we resolve
 * ambiguity conservatively in favour of protecting minors:
 *  - Registration requires the user to be at least 13 for certain (year difference >= 14).
 *  - Anyone who might still be under 18 (year difference <= 18) gets a TEEN account.
 */
export const MIN_AGE = 13;
export const ADULT_AGE = 18;

export type AgeResolution = "TOO_YOUNG" | "TEEN" | "ADULT";

export function ageGroupFor(birthYear: number, now = new Date()): AgeResolution {
  const diff = now.getUTCFullYear() - birthYear;
  if (diff < MIN_AGE + 1) return "TOO_YOUNG";
  if (diff <= ADULT_AGE) return "TEEN";
  return "ADULT";
}
