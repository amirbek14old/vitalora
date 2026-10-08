import { z } from "zod";

export const emailSchema = z.string().trim().toLowerCase().email().max(254);
export const passwordSchema = z
  .string()
  .min(10)
  .max(128)
  .regex(/[A-Za-zА-Яа-яЁё]/, "letter")
  .regex(/\d/, "number");

const currentYear = new Date().getUTCFullYear();

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  displayName: z.string().trim().min(2).max(40).regex(/^[\p{L}\p{N} ._-]+$/u),
  birthYear: z.coerce.number().int().min(currentYear - 110).max(currentYear),
  acceptTerms: z.literal("on"),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(128),
});

export const goalValues = ["move", "strength", "sleep", "eat", "learn", "stress"] as const;
export const difficultyValues = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;

export const onboardingSchema = z.object({
  experienceLevel: z.enum(difficultyValues),
  goals: z.array(z.enum(goalValues)).max(6),
  minutesPerDay: z.coerce.number().int().min(5).max(180),
  starterHabits: z.boolean(),
});

export const profileSchema = z.object({
  displayName: z.string().trim().min(2).max(40).regex(/^[\p{L}\p{N} ._-]+$/u),
  bio: z.string().trim().max(280).optional().default(""),
  experienceLevel: z.enum(difficultyValues),
  minutesPerDay: z.coerce.number().int().min(5).max(180),
  goals: z.array(z.enum(goalValues)).max(6),
});

const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);

export const sleepLogSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  bedtime: hhmm,
  wakeTime: hhmm,
  quality: z.coerce.number().int().min(1).max(5),
  notes: z.string().trim().max(500).optional().default(""),
});

export const workoutSchema = z.object({
  title: z.string().trim().min(1).max(120),
  durationMin: z.coerce.number().int().min(1).max(300),
  effort: z.coerce.number().int().min(1).max(5),
  notes: z.string().trim().max(500).optional().default(""),
  exerciseSlugs: z.array(z.string().max(80)).max(30).optional().default([]),
});

export const habitCategoryValues = ["MOVEMENT", "SLEEP", "MEALS", "LEARNING", "BREAKS", "HYDRATION", "CUSTOM"] as const;

export const habitSchema = z.object({
  title: z.string().trim().min(1).max(80),
  category: z.enum(habitCategoryValues),
  targetPerWeek: z.coerce.number().int().min(1).max(7),
});

export const routineSchema = z.object({
  minutes: z.coerce.number().int().refine((v) => [10, 15, 20, 30, 45].includes(v)),
  level: z.enum(difficultyValues),
  focus: z.enum(["full", "lower", "upper", "mobility"]),
});

export const chatSchema = z.object({
  conversationId: z.string().cuid().optional(),
  message: z.string().trim().min(1).max(2000),
  mode: z.enum(["chat", "recipe", "insight"]).optional().default("chat"),
});

export const postSchema = z.object({
  communityId: z.string().cuid(),
  parentId: z.string().cuid().optional(),
  body: z.string().trim().min(2).max(1000),
});

export const reportSchema = z.object({
  postId: z.string().cuid(),
  reason: z.string().trim().min(3).max(300),
});

export const settingsSchema = z.object({
  locale: z.enum(["uz", "en", "ru"]),
  theme: z.enum(["light", "dark", "system"]),
  aiConsent: z.boolean(),
  aiPersonalizationConsent: z.boolean(),
  analyticsConsent: z.boolean(),
  communityVisible: z.boolean(),
  remindersEnabled: z.boolean(),
  reminderTime: hhmm.optional().or(z.literal("")),
});

export const foodItemSchema = z.object({
  name: z.string().trim().min(1).max(80),
  portionGrams: z.number().min(1).max(3000),
  kcal: z.number().min(0).max(5000).nullable().optional(),
  proteinG: z.number().min(0).max(500).nullable().optional(),
  carbsG: z.number().min(0).max(800).nullable().optional(),
  fatG: z.number().min(0).max(500).nullable().optional(),
  foodGroup: z.enum(["vegetables", "fruits", "grains", "protein", "dairy", "fats", "sweets", "drinks", "mixed"]),
  confidence: z.enum(["low", "medium", "high"]).optional(),
});

export const saveMealSchema = z.object({
  items: z.array(foodItemSchema).min(1).max(20),
  balanceNote: z.string().max(500).optional(),
});

/** Parse checkbox-style booleans from FormData. */
export function formBool(fd: FormData, key: string): boolean {
  const v = fd.get(key);
  return v === "on" || v === "true" || v === "1";
}
