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

const GROUPS = ["vegetables", "fruits", "grains", "protein", "dairy", "fats", "sweets", "drinks", "mixed"] as const;
const GROUP_ALIASES: Record<string, (typeof GROUPS)[number]> = {
  vegetable: "vegetables", veg: "vegetables", salad: "vegetables",
  fruit: "fruits", berries: "fruits",
  grain: "grains", bread: "grains", bakery: "grains", cereal: "grains", cereals: "grains", pasta: "grains", rice: "grains", carbs: "grains",
  meat: "protein", fish: "protein", eggs: "protein", egg: "protein", legumes: "protein", beans: "protein", nuts: "protein",
  milk: "dairy", cheese: "dairy", yogurt: "dairy",
  fat: "fats", oil: "fats", oils: "fats",
  sweet: "sweets", dessert: "sweets", desserts: "sweets", snack: "sweets", snacks: "sweets", candy: "sweets",
  drink: "drinks", beverage: "drinks", beverages: "drinks", juice: "drinks", soda: "drinks",
};

const num = (v: unknown): number | null => {
  const n = typeof v === "string" ? Number(v.replace(",", ".").replace(/[^0-9.]/g, "")) : typeof v === "number" ? v : NaN;
  return Number.isFinite(n) ? Math.round(n * 10) / 10 : null;
};
const clamp = (v: number | null, max: number) => (v == null ? null : Math.min(Math.max(v, 0), max));

/** Extract the JSON object returned by the vision model and normalise it (models vary in format). Throws on unusable output. */
export function parseFoodAnalysis(raw: string): FoodAnalysis {
  const cleaned = raw.replace(/```(?:json)?/gi, "");
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end <= start) throw new Error(`No JSON object in model output: ${raw.slice(0, 120)}`);
  const json = JSON.parse(cleaned.slice(start, end + 1)) as Record<string, unknown>;
  const rawItems = Array.isArray(json.items) ? (json.items as Record<string, unknown>[]) : [];
  const items = rawItems.slice(0, 20).flatMap((it) => {
    const name = String(it.name ?? it.food ?? "").trim().slice(0, 80);
    const portion = clamp(num(it.portionGrams ?? it.grams ?? it.portion), 3000);
    if (!name) return [];
    const g = String(it.foodGroup ?? "").toLowerCase().trim();
    const foodGroup = (GROUPS as readonly string[]).includes(g) ? (g as (typeof GROUPS)[number]) : GROUP_ALIASES[g] ?? "mixed";
    const c = String(it.confidence ?? "").toLowerCase();
    return [{
      name,
      portionGrams: portion && portion >= 1 ? portion : 100,
      kcal: clamp(num(it.kcal ?? it.calories), 5000),
      proteinG: clamp(num(it.proteinG ?? it.protein), 500),
      carbsG: clamp(num(it.carbsG ?? it.carbs), 800),
      fatG: clamp(num(it.fatG ?? it.fat), 500),
      foodGroup,
      confidence: c === "low" || c === "medium" || c === "high" ? c : "medium",
    }];
  });
  const isFood = json.isFood === undefined ? items.length > 0 : json.isFood === true || json.isFood === "true";
  return foodAnalysisSchema.parse({ isFood, items, balanceNote: String(json.balanceNote ?? "").slice(0, 500) });
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
