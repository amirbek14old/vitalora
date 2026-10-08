import "server-only";
import { db } from "@/lib/db";
import { addDays, isoDate, lastNDays, startOfDayUTC } from "@/lib/utils";
import type { WeeklySnapshot } from "@/lib/recommendations";

export type DayPoint = { date: string; minutes: number; sleepHours: number | null };

export async function getWeeklyStats(userId: string) {
  const days = lastNDays(7);
  const from = days[0];
  const to = addDays(startOfDayUTC(new Date()), 1);

  const [workouts, sleeps, habits, entries, lessons, totalWorkoutsEver] = await Promise.all([
    db.workoutSession.findMany({ where: { userId, date: { gte: from, lt: to } }, select: { date: true, durationMin: true } }),
    db.sleepLog.findMany({ where: { userId, date: { gte: from, lt: to } }, select: { date: true, minutes: true, quality: true } }),
    db.habit.count({ where: { userId, archived: false, paused: false } }),
    db.habitEntry.count({ where: { habit: { userId }, date: { gte: from, lt: to } } }),
    db.lessonProgress.count({ where: { userId, completedAt: { gte: from, lt: to } } }),
    db.workoutSession.count({ where: { userId } }),
  ]);

  const points: DayPoint[] = days.map((d) => {
    const key = isoDate(d);
    const minutes = workouts.filter((w) => isoDate(startOfDayUTC(w.date)) === key).reduce((a, w) => a + w.durationMin, 0);
    const sleep = sleeps.find((s) => isoDate(s.date) === key);
    return { date: key, minutes, sleepHours: sleep ? Math.round((sleep.minutes / 60) * 10) / 10 : null };
  });

  const snapshot: WeeklySnapshot = {
    workouts: workouts.length,
    activeMinutes: workouts.reduce((a, w) => a + w.durationMin, 0),
    sleepNights: sleeps.length,
    avgSleepMinutes: sleeps.length ? Math.round(sleeps.reduce((a, s) => a + s.minutes, 0) / sleeps.length) : null,
    habitCount: habits,
    habitCheckins: entries,
    lessonsThisWeek: lessons,
    totalWorkoutsEver,
  };
  const avgQuality = sleeps.length ? Math.round((sleeps.reduce((a, s) => a + s.quality, 0) / sleeps.length) * 10) / 10 : null;
  return { points, snapshot, avgQuality };
}

/** Non-identifying summary for AI personalisation (only used with explicit consent). */
export function summariseForAI(s: WeeklySnapshot): string {
  return [
    `workouts this week: ${s.workouts} (${s.activeMinutes} min)`,
    `sleep nights logged: ${s.sleepNights}${s.avgSleepMinutes ? `, average ${(s.avgSleepMinutes / 60).toFixed(1)} h` : ""}`,
    `active habits: ${s.habitCount}, check-ins: ${s.habitCheckins}`,
    `lessons completed this week: ${s.lessonsThisWeek}`,
  ].join("; ");
}
