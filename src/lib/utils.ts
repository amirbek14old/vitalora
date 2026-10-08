import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Start of a UTC day for a Date. Habit and sleep dates are stored as calendar days. */
export function startOfDayUTC(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export function addDays(d: Date, days: number): Date {
  const r = new Date(d);
  r.setUTCDate(r.getUTCDate() + days);
  return r;
}

/** Monday-based start of week (UTC). */
export function startOfWeekUTC(d: Date): Date {
  const day = startOfDayUTC(d);
  const dow = (day.getUTCDay() + 6) % 7; // 0 = Monday
  return addDays(day, -dow);
}

export function lastNDays(n: number, today = new Date()): Date[] {
  const end = startOfDayUTC(today);
  return Array.from({ length: n }, (_, i) => addDays(end, i - (n - 1)));
}

export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Minutes between "HH:MM" bedtime and wake time, crossing midnight if needed. */
export function sleepMinutes(bedtime: string, wakeTime: string): number {
  const [bh, bm] = bedtime.split(":").map(Number);
  const [wh, wm] = wakeTime.split(":").map(Number);
  let mins = wh * 60 + wm - (bh * 60 + bm);
  if (mins <= 0) mins += 24 * 60;
  return mins;
}

export function formatHours(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m ? `${h}:${String(m).padStart(2, "0")}` : `${h}:00`;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
