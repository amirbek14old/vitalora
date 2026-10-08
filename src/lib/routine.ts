export type Level = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export type Focus = "full" | "lower" | "upper" | "mobility";

export type RoutineExercise = {
  slug: string;
  category: string;
  difficulty: Level;
  muscleGroups: string[];
};

export type Routine = {
  warmup: RoutineExercise[];
  main: RoutineExercise[];
  cooldown: RoutineExercise[];
  rounds: number;
  workSec: number;
  restSec: number;
  totalMinutes: number;
};

const levelRank: Record<Level, number> = { BEGINNER: 0, INTERMEDIATE: 1, ADVANCED: 2 };
const timing: Record<Level, { work: number; rest: number }> = {
  BEGINNER: { work: 30, rest: 30 },
  INTERMEDIATE: { work: 40, rest: 20 },
  ADVANCED: { work: 45, rest: 15 },
};

const focusMuscles: Record<Focus, string[]> = {
  full: [],
  lower: ["legs", "glutes", "calves", "hips"],
  upper: ["chest", "shoulders", "arms", "back", "core"],
  mobility: [],
};

/** Deterministic shuffle so the same seed yields the same routine (testable), different seeds vary it. */
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed || 1;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Build a balanced, time-boxed routine: warm-up → circuit → cool-down.
 * Only exercises at or below the user's level are used.
 */
export function buildRoutine(
  library: RoutineExercise[],
  opts: { minutes: number; level: Level; focus: Focus; seed?: number },
): Routine {
  const seed = opts.seed ?? 1;
  const allowed = library.filter((e) => levelRank[e.difficulty] <= levelRank[opts.level]);
  const warmup = seededShuffle(allowed.filter((e) => e.category === "warmup"), seed).slice(0, 2);
  const cooldown = seededShuffle(allowed.filter((e) => e.category === "cooldown"), seed + 1).slice(0, 2);

  let pool: RoutineExercise[];
  if (opts.focus === "mobility") {
    pool = allowed.filter((e) => e.category === "mobility" || e.category === "balance");
  } else {
    const main = allowed.filter((e) => ["strength", "cardio", "balance"].includes(e.category));
    const wanted = focusMuscles[opts.focus];
    pool = wanted.length ? main.filter((e) => e.muscleGroups.some((m) => wanted.includes(m))) : main;
    if (pool.length < 3) pool = main;
  }

  const { work, rest } = timing[opts.level];
  const count = Math.min(pool.length, opts.minutes <= 15 ? 4 : 5);
  const mainList = seededShuffle(pool, seed + 2).slice(0, count);

  const fixedMinutes = (warmup.length + cooldown.length) * 1; // ~1 minute each
  const circuitSeconds = Math.max(4 * 60, (opts.minutes - fixedMinutes) * 60);
  const perRound = Math.max(1, mainList.length) * (work + rest);
  const rounds = Math.max(1, Math.min(5, Math.round(circuitSeconds / perRound)));
  const totalMinutes = Math.round(fixedMinutes + (rounds * perRound) / 60);

  return { warmup, main: mainList, cooldown, rounds, workSec: work, restSec: rest, totalMinutes };
}
