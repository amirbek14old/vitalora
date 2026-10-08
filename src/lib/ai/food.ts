import { z } from "zod";
import { foodItemSchema } from "@/lib/validation";

export type FoodItem = z.infer<typeof foodItemSchema>;

export const foodAnalysisSchema = z.object({
  isFood: z.boolean(),
  items: z.array(foodItemSchema).max(20),
  balanceNote: z.string().max(500).optional().default(""),
});
export type FoodAnalysis = z.infer<typeof foodAnalysisSchema>;

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

/** Extract and validate the JSON object returned by the vision model. Throws on invalid output. */
export function parseFoodAnalysis(raw: string): FoodAnalysis {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end <= start) throw new Error("No JSON object in model output");
  const json: unknown = JSON.parse(raw.slice(start, end + 1));
  // Models sometimes return numbers as strings — coerce before strict validation.
  if (json && typeof json === "object" && Array.isArray((json as { items?: unknown }).items)) {
    for (const item of (json as { items: Record<string, unknown>[] }).items) {
      for (const k of ["portionGrams", "kcal", "proteinG", "carbsG", "fatG"]) {
        if (typeof item[k] === "string") item[k] = Number(item[k]);
        if (typeof item[k] === "number") item[k] = Math.round((item[k] as number) * 10) / 10;
      }
    }
  }
  return foodAnalysisSchema.parse(json);
}

/** Remove energy and macro numbers (teen accounts). */
export function stripNumbers(analysis: FoodAnalysis): FoodAnalysis {
  return {
    ...analysis,
    items: analysis.items.map(({ name, portionGrams, foodGroup, confidence }) => ({ name, portionGrams, foodGroup, confidence })),
  };
}

/** Scale an item's nutrition values proportionally to a new portion size. */
export function scaleItem(item: FoodItem, newPortion: number): FoodItem {
  const ratio = item.portionGrams > 0 ? newPortion / item.portionGrams : 1;
  const s = (v: number | null | undefined) => (v == null ? v : Math.round(v * ratio * 10) / 10);
  return { ...item, portionGrams: newPortion, kcal: s(item.kcal), proteinG: s(item.proteinG), carbsG: s(item.carbsG), fatG: s(item.fatG) };
}

export function totals(items: FoodItem[]) {
  const sum = (k: "kcal" | "proteinG" | "carbsG" | "fatG") =>
    Math.round(items.reduce((acc, i) => acc + (i[k] ?? 0), 0) * 10) / 10;
  return { kcal: Math.round(sum("kcal")), proteinG: sum("proteinG"), carbsG: sum("carbsG"), fatG: sum("fatG") };
}

/** Detect image type from magic bytes (don't trust the client-provided MIME type). */
export function sniffImageType(bytes: Uint8Array): (typeof ALLOWED_IMAGE_TYPES)[number] | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "image/png";
  if (
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  )
    return "image/webp";
  return null;
}
