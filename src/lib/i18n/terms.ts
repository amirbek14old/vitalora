import type { Locale } from "./config";

/** Translations for controlled vocabulary stored as codes in the DB (food groups, allergens, muscles). */
const terms: Record<Locale, Record<string, string>> = {
  en: {
    vegetables: "Vegetables", fruits: "Fruits", grains: "Grains", protein: "Protein foods", dairy: "Dairy", fats: "Healthy fats", sweets: "Sweets", drinks: "Drinks", mixed: "Mixed dish",
    milk: "Milk", egg: "Egg", "tree nuts": "Tree nuts", peanuts: "Peanuts", gluten: "Gluten", "gluten (oats may be cross-contaminated)": "Gluten (oats may be cross-contaminated)", soy: "Soy", fish: "Fish", sesame: "Sesame",
    legs: "Legs", glutes: "Glutes", calves: "Calves", hips: "Hips", chest: "Chest", shoulders: "Shoulders", arms: "Arms", back: "Back", core: "Core",
  },
  uz: {
    vegetables: "Sabzavotlar", fruits: "Mevalar", grains: "Donli mahsulotlar", protein: "Oqsilli mahsulotlar", dairy: "Sut mahsulotlari", fats: "Sogʻlom yogʻlar", sweets: "Shirinliklar", drinks: "Ichimliklar", mixed: "Aralash taom",
    milk: "Sut", egg: "Tuxum", "tree nuts": "Yongʻoqlar", peanuts: "Yeryongʻoq", gluten: "Glyuten", "gluten (oats may be cross-contaminated)": "Glyuten (sulida aralashma boʻlishi mumkin)", soy: "Soya", fish: "Baliq", sesame: "Kunjut",
    legs: "Oyoqlar", glutes: "Dumba", calves: "Boldir", hips: "Son-chanoq", chest: "Koʻkrak", shoulders: "Yelka", arms: "Qoʻllar", back: "Orqa", core: "Kor (tana markazi)",
  },
  ru: {
    vegetables: "Овощи", fruits: "Фрукты", grains: "Зерновые", protein: "Белковые продукты", dairy: "Молочные продукты", fats: "Полезные жиры", sweets: "Сладости", drinks: "Напитки", mixed: "Смешанное блюдо",
    milk: "Молоко", egg: "Яйца", "tree nuts": "Орехи", peanuts: "Арахис", gluten: "Глютен", "gluten (oats may be cross-contaminated)": "Глютен (возможны следы в овсе)", soy: "Соя", fish: "Рыба", sesame: "Кунжут",
    legs: "Ноги", glutes: "Ягодицы", calves: "Икры", hips: "Бёдра и таз", chest: "Грудь", shoulders: "Плечи", arms: "Руки", back: "Спина", core: "Кор",
  },
};

export function term(code: string, locale: Locale): string {
  return terms[locale][code] ?? terms.en[code] ?? code;
}
