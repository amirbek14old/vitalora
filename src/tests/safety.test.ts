import { describe, expect, it } from "vitest";
import { classifyInput, guardOutput, isBlockingCategory, safeResponse } from "@/lib/ai/safety";

describe("classifyInput", () => {
  it.each([
    ["I want to kill myself", "self_harm"],
    ["Oʻzimni oʻldirmoqchiman", "self_harm"],
    ["не хочу жить", "self_harm"],
    ["I have chest pain while running", "emergency"],
    ["Не могу дышать после бега", "emergency"],
    ["how to eat 500 calories a day", "disordered_eating"],
    ["I want to stop eating to get thin", "disordered_eating"],
    ["хочу перестать есть", "disordered_eating"],
    ["what dose of creatine should I take", "medication"],
    ["стероиды для мышц", "medication"],
  ])("flags %s as %s", (text, expected) => {
    expect(classifyInput(text)).toBe(expected);
  });

  it.each(["How do I warm up?", "Osh qanday pishiriladi?", "Как улучшить сон?", "What is a squat?"])("does not flag normal question: %s", (text) => {
    expect(classifyInput(text)).toBeNull();
  });

  it("blocks only crisis-type categories", () => {
    expect(isBlockingCategory("self_harm")).toBe(true);
    expect(isBlockingCategory("emergency")).toBe(true);
    expect(isBlockingCategory("disordered_eating")).toBe(true);
    expect(isBlockingCategory("medication")).toBe(false);
    expect(isBlockingCategory(null)).toBe(false);
  });

  it("has a safe response in every language", () => {
    for (const l of ["uz", "en", "ru"] as const) {
      expect(safeResponse("self_harm", l).length).toBeGreaterThan(50);
    }
  });
});

describe("guardOutput", () => {
  it("replaces advice recommending very low daily intake", () => {
    const r = guardOutput("Try eating 800 kcal per day for quick results", { locale: "en", teen: false });
    expect(r.flagged).toBe("disordered_eating");
    expect(r.text).not.toContain("800");
  });

  it("strips calorie numbers for teens", () => {
    const r = guardOutput("A bowl of plov has about 600 kcal.", { locale: "en", teen: true });
    expect(r.text).not.toMatch(/600\s*kcal/);
  });

  it("keeps normal adult answers unchanged", () => {
    const text = "A bowl of plov may contain roughly 600 kcal depending on oil.";
    expect(guardOutput(text, { locale: "en", teen: false }).text).toBe(text);
  });
});
