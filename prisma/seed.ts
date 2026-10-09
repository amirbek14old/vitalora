/* Seeds educational content (idempotent upserts) and the first admin account. */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { exercises } from "./seed-data/exercises";
import { recipes } from "./seed-data/recipes";
import { courses, nutritionLessons, achievements, communities } from "./seed-data/education";
import { shopItems } from "./seed-data/shop";

try {
  process.loadEnvFile?.(".env");
} catch {
  /* .env is optional when variables are provided by the environment */
}

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

async function main() {
  for (const e of exercises) {
    const data = { ...e, reviewed: true, published: true };
    await db.exercise.upsert({ where: { slug: e.slug }, update: data, create: data });
  }
  console.log(`✓ ${exercises.length} exercises`);

  for (const r of recipes) {
    await db.recipe.upsert({ where: { slug: r.slug }, update: r, create: r });
  }
  console.log(`✓ ${recipes.length} recipes`);

  for (const n of nutritionLessons) {
    await db.nutritionLesson.upsert({ where: { slug: n.slug }, update: n, create: n });
  }
  console.log(`✓ ${nutritionLessons.length} nutrition lessons`);

  for (const c of courses) {
    const { lessons, ...courseData } = c;
    const course = await db.course.upsert({ where: { slug: c.slug }, update: courseData, create: courseData });
    for (const [i, l] of lessons.entries()) {
      const { questions, ...lessonData } = l;
      const lesson = await db.lesson.upsert({
        where: { courseId_slug: { courseId: course.id, slug: l.slug } },
        update: { ...lessonData, order: i + 1 },
        create: { ...lessonData, order: i + 1, courseId: course.id },
      });
      await db.quizQuestion.deleteMany({ where: { lessonId: lesson.id } });
      await db.quizQuestion.createMany({ data: questions.map((q, qi) => ({ ...q, order: qi, lessonId: lesson.id })) });
    }
  }
  console.log(`✓ ${courses.length} courses`);

  for (const a of achievements) {
    await db.achievement.upsert({ where: { code: a.code }, update: a, create: a });
  }
  console.log(`✓ ${achievements.length} achievements`);

  for (const c of communities) {
    await db.community.upsert({ where: { slug: c.slug }, update: c, create: c });
  }
  console.log(`✓ ${communities.length} communities`);

  for (const item of shopItems) {
    const data = { ...item, proOnly: item.proOnly ?? false };
    await db.shopItem.upsert({ where: { code: item.code }, update: data, create: data });
  }
  console.log(`✓ ${shopItems.length} shop items`);

  const email = process.env.SEED_ADMIN_EMAIL?.toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (email && password) {
    const existing = await db.user.findUnique({ where: { email } });
    if (!existing) {
      await db.user.create({
        data: {
          email,
          role: "ADMIN",
          passwordHash: await bcrypt.hash(password, 12),
          profile: { create: { displayName: "Admin", birthYear: 1990, ageGroup: "ADULT", onboardingDone: true } },
          preference: { create: {} },
        },
      });
      console.log(`✓ admin ${email} created — change the password after first login`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
