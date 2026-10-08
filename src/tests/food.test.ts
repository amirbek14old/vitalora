import { describe, expect, it } from "vitest";
import { parseFoodAnalysis, scaleItem, sniffImageType, stripNumbers, totals } from "@/lib/ai/food";

const sample = `Here is the result:
{"isFood": true, "items": [
  {"name": "Osh", "portionGrams": "300", "kcal": 540, "proteinG": 18, "carbsG": 70, "fatG": 20, "foodGroup": "mixed", "confidence": "medium"},
  {"name": "Achchiq-chuchuk", "portionGrams": 100, "kcal": 25, "proteinG": 1, "carbsG": 5, "fatG": 0.2, "foodGroup": "vegetables", "confidence": "high"}
], "balanceNote": "Good to have vegetables."}`;

describe("parseFoodAnalysis", () => {
  it("extracts JSON from surrounding text and coerces numeric strings", () => {
    const a = parseFoodAnalysis(sample);
    expect(a.isFood).toBe(true);
    expect(a.items).toHaveLength(2);
    expect(a.items[0].portionGrams).toBe(300);
  });

  it("rejects invalid structures", () => {
    expect(() => parseFoodAnalysis("no json here")).toThrow();
    expect(() => parseFoodAnalysis('{"isFood": true, "items": [{"name": "x"}]}')).toThrow();
    expect(() => parseFoodAnalysis('{"isFood": true, "items": [{"name":"x","portionGrams":10,"foodGroup":"poison"}]}')).toThrow();
  });
});

describe("nutrition maths", () => {
  const items = parseFoodAnalysis(sample).items;

  it("totals energy and macros", () => {
    expect(totals(items)).toEqual({ kcal: 565, proteinG: 19, carbsG: 75, fatG: 20.2 });
  });

  it("scales an item proportionally to a new portion", () => {
    const scaled = scaleItem(items[0], 150);
    expect(scaled.portionGrams).toBe(150);
    expect(scaled.kcal).toBe(270);
    expect(scaled.proteinG).toBe(9);
  });

  it("strips numbers for teen accounts", () => {
    const s = stripNumbers(parseFoodAnalysis(sample));
    expect(s.items[0]).not.toHaveProperty("kcal");
    expect(s.items[0].name).toBe("Osh");
  });
});

describe("sniffImageType", () => {
  it("detects by magic bytes", () => {
    expect(sniffImageType(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))).toBe("image/jpeg");
    expect(sniffImageType(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0, 0, 0, 0]))).toBe("image/png");
    expect(sniffImageType(new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]))).toBe("image/webp");
    expect(sniffImageType(new TextEncoder().encode("<svg onload=alert(1)>"))).toBeNull();
  });
});
