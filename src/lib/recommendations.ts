export type WeeklySnapshot = {
  workouts: number;
  activeMinutes: number;
  sleepNights: number;
  avgSleepMinutes: number | null;
  habitCount: number;
  habitCheckins: number;
  lessonsThisWeek: number;
  totalWorkoutsEver: number;
};

export type RecommendationKey =
  | "firstWorkout"
  | "moreMovement"
  | "sleepLog"
  | "sleepShort"
  | "habitStart"
  | "learn"
  | "hydrate"
  | "great";

/** Gentle, rule-based educational suggestions. Never punitive; at most 3. */
export function recommend(s: WeeklySnapshot, teen: boolean): RecommendationKey[] {
  const out: RecommendationKey[] = [];
  if (s.totalWorkoutsEver === 0) out.push("firstWorkout");
  else if (s.workouts < 3) out.push("moreMovement");
  if (s.sleepNights === 0) out.push("sleepLog");
  else if (s.avgSleepMinutes !== null && s.avgSleepMinutes < (teen ? 8 * 60 : 7 * 60)) out.push("sleepShort");
  if (s.habitCount === 0) out.push("habitStart");
  if (s.lessonsThisWeek === 0) out.push("learn");
  if (out.length === 0) out.push("great");
  if (out.length < 3 && !out.includes("great")) out.push("hydrate");
  return out.slice(0, 3);
}
