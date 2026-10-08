import { describe, expect, it } from "vitest";
import { buildRoutine, type RoutineExercise } from "@/lib/routine";
import { recommend } from "@/lib/recommendations";
import { ageGroupFor } from "@/lib/age";
import { sleepMinutes, startOfWeekUTC, lastNDays, isoDate } from "@/lib/utils";
import { needsReview } from "@/lib/moderation";
import { registerSchema } from "@/lib/validation";
import { matchAcceptLanguage, tr, trList, fmt } from "@/lib/i18n/config";
import { exercises } from "../../prisma/seed-data/exercises";

const library: RoutineExercise[] = exercises.map((e) => ({ slug: e.slug, category: e.category, difficulty: e.difficulty, muscleGroups: e.muscleGroups }));

describe("buildRoutine", () => {
  it("includes warm-up, main and cool-down, and respects level", () => {
    const r = buildRoutine(library, { minutes: 15, level: "BEGINNER", focus: "full", seed: 3 });
    expect(r.warmup.length).toBeGreaterThan(0);
    expect(r.cooldown.length).toBeGreaterThan(0);
    expect(r.main.length).toBeGreaterThanOrEqual(3);
    expect([...r.warmup, ...r.main, ...r.cooldown].every((e) => e.difficulty === "BEGINNER")).toBe(true);
    expect(r.totalMinutes).toBeLessThanOrEqual(20);
  });

  it("is deterministic for the same seed", () => {
    const a = buildRoutine(library, { minutes: 20, level: "INTERMEDIATE", focus: "lower", seed: 7 });
    const b = buildRoutine(library, { minutes: 20, level: "INTERMEDIATE", focus: "lower", seed: 7 });
    expect(a.main.map((e) => e.slug)).toEqual(b.main.map((e) => e.slug));
  });

  it("uses mobility exercises for the mobility focus", () => {
    const r = buildRoutine(library, { minutes: 10, level: "BEGINNER", focus: "mobility" });
    expect(r.main.every((e) => e.category === "mobility" || e.category === "balance")).toBe(true);
  });
});

describe("recommend", () => {
  const base = { workouts: 0, activeMinutes: 0, sleepNights: 0, avgSleepMinutes: null, habitCount: 0, habitCheckins: 0, lessonsThisWeek: 0, totalWorkoutsEver: 0 };
  it("suggests a first workout and gentle steps to new users (max 3)", () => {
    const r = recommend(base, false);
    expect(r[0]).toBe("firstWorkout");
    expect(r.length).toBeLessThanOrEqual(3);
  });
  it("uses a higher sleep threshold for teens", () => {
    const s = { ...base, totalWorkoutsEver: 5, workouts: 4, sleepNights: 5, avgSleepMinutes: 7.5 * 60, habitCount: 2, lessonsThisWeek: 1 };
    expect(recommend(s, true)).toContain("sleepShort");
    expect(recommend(s, false)).not.toContain("sleepShort");
  });
  it("celebrates consistency", () => {
    expect(recommend({ ...base, totalWorkoutsEver: 9, workouts: 4, sleepNights: 6, avgSleepMinutes: 480, habitCount: 3, lessonsThisWeek: 2 }, false)).toEqual(["great"]);
  });
});

describe("ageGroupFor", () => {
  const now = new Date("2026-10-08T00:00:00Z");
  it("blocks anyone who could be under 13", () => {
    expect(ageGroupFor(2014, now)).toBe("TOO_YOUNG");
    expect(ageGroupFor(2013, now)).toBe("TOO_YOUNG");
  });
  it("treats possible minors as teens", () => {
    expect(ageGroupFor(2012, now)).toBe("TEEN");
    expect(ageGroupFor(2008, now)).toBe("TEEN");
  });
  it("adults", () => {
    expect(ageGroupFor(2007, now)).toBe("ADULT");
  });
});

describe("utils", () => {
  it("computes sleep across midnight", () => {
    expect(sleepMinutes("23:30", "07:00")).toBe(450);
    expect(sleepMinutes("01:00", "08:15")).toBe(435);
  });
  it("week starts on Monday", () => {
    expect(isoDate(startOfWeekUTC(new Date("2026-10-08T12:00:00Z")))).toBe("2026-10-05");
  });
  it("lastNDays returns consecutive days ending today", () => {
    const d = lastNDays(7, new Date("2026-10-08T12:00:00Z"));
    expect(d.map(isoDate)).toEqual(["2026-10-02", "2026-10-03", "2026-10-04", "2026-10-05", "2026-10-06", "2026-10-07", "2026-10-08"]);
  });
});

describe("moderation", () => {
  it("holds links, contact details and body-shaming for review", () => {
    expect(needsReview("check https://spam.example")).toBe(true);
    expect(needsReview("call me +998 90 123 45 67")).toBe(true);
    expect(needsReview("you look fat")).toBe(true);
    expect(needsReview("Great job on your walk today!")).toBe(false);
  });
});

describe("validation", () => {
  const ok = { email: "A@Example.com ", password: "healthy2026x", displayName: "Amir", birthYear: "2000", acceptTerms: "on" };
  it("accepts and normalises a valid registration", () => {
    const r = registerSchema.safeParse(ok);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.email).toBe("a@example.com");
  });
  it("rejects weak passwords and script injection in names", () => {
    expect(registerSchema.safeParse({ ...ok, password: "short1" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...ok, password: "nonumbersatall" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...ok, displayName: "<script>" }).success).toBe(false);
  });
});

describe("i18n helpers", () => {
  it("matches Accept-Language", () => {
    expect(matchAcceptLanguage("ru-RU,ru;q=0.9,en;q=0.8")).toBe("ru");
    expect(matchAcceptLanguage("de-DE,en;q=0.5")).toBe("en");
    expect(matchAcceptLanguage(null)).toBe("uz");
  });
  it("translates localized JSON with fallback", () => {
    expect(tr({ uz: "Salom", en: "Hello" }, "ru")).toBe("Hello");
    expect(trList({ uz: ["a"], en: ["b"] }, "uz")).toEqual(["a"]);
    expect(fmt("{done} of {target}", { done: 2, target: 5 })).toBe("2 of 5");
  });
});
