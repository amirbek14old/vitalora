/**
 * Lightweight pre-moderation. Posts that match are held as PENDING for a moderator
 * instead of being published immediately. This is a first line of defence, not a classifier.
 */
const patterns: RegExp[] = [
  /https?:\/\//i, // links (spam / promotion)
  /www\./i,
  /\+?\d[\d\s\-()]{8,}\d/, // phone numbers (private info)
  /[\w.+-]+@[\w-]+\.[\w.]+/, // email addresses
  /\b(fat|ugly|disgusting|pig)\b/i,
  /\b(semiz|xunuk|yaramas)\b/i,
  /(жирн|урод|свинья)/i,
  /\b(diet pills?|fat burner|steroids?|sarms?)\b/i,
  /(dori|tabletka)\s+(ozish|ozdiruvchi)/i,
  /(таблетки|жиросжигат)/i,
];

export function needsReview(text: string): boolean {
  return patterns.some((p) => p.test(text));
}
