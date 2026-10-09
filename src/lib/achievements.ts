import "server-only";
import { db } from "@/lib/db";
import { awardCoins } from "@/lib/coins";

type Check = (userId: string) => Promise<boolean>;

/** Personal achievements — celebrate consistency & learning, never compare users. */
export const ACHIEVEMENT_CHECKS: Record<string, Check> = {
  first_workout: async (u) => (await db.workoutSession.count({ where: { userId: u } })) >= 1,
  ten_workouts: async (u) => (await db.workoutSession.count({ where: { userId: u } })) >= 10,
  first_sleep_log: async (u) => (await db.sleepLog.count({ where: { userId: u } })) >= 1,
  sleep_week: async (u) => (await db.sleepLog.count({ where: { userId: u } })) >= 7,
  first_habit: async (u) => (await db.habit.count({ where: { userId: u } })) >= 1,
  habit_25: async (u) => (await db.habitEntry.count({ where: { habit: { userId: u } } })) >= 25,
  first_lesson: async (u) => (await db.lessonProgress.count({ where: { userId: u } })) >= 1,
  quiz_perfect: async (u) => {
    const attempts = await db.quizAttempt.findMany({ where: { userId: u }, select: { score: true, total: true } });
    return attempts.some((a) => a.total > 0 && a.score === a.total);
  },
  first_course: async (u) => {
    const courses = await db.course.findMany({ where: { published: true }, select: { lessons: { select: { id: true } } } });
    const done = new Set((await db.lessonProgress.findMany({ where: { userId: u }, select: { lessonId: true } })).map((p) => p.lessonId));
    return courses.some((c) => c.lessons.length > 0 && c.lessons.every((l) => done.has(l.id)));
  },
  first_meal: async (u) => (await db.mealLog.count({ where: { userId: u } })) >= 1,
  community_voice: async (u) => (await db.communityPost.count({ where: { authorId: u } })) >= 1,
};

/** Grant any newly earned achievements and notify the user. Returns newly granted codes. */
export async function evaluateAchievements(userId: string, only?: string[]): Promise<string[]> {
  const defs = await db.achievement.findMany({
    where: only ? { code: { in: only } } : undefined,
    select: { id: true, code: true, users: { where: { userId }, select: { id: true } } },
  });
  const granted: string[] = [];
  for (const def of defs) {
    if (def.users.length) continue;
    const check = ACHIEVEMENT_CHECKS[def.code];
    if (!check || !(await check(userId))) continue;
    await db.userAchievement.create({ data: { userId, achievementId: def.id } }).catch(() => null);
    // Store the code; the UI renders the localised achievement title.
    await db.notification.create({ data: { userId, kind: "achievement", title: def.code } });
    await awardCoins(userId, "achievement", `ach:${def.code}`);
    granted.push(def.code);
  }
  return granted;
}
