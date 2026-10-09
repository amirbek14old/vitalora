type L = { uz: string; en: string; ru: string };
export type ShopSeed = { code: string; kind: "FRAME" | "BANNER" | "NAME_COLOR" | "BADGE" | "PRO_PASS"; name: L; price: number; proOnly?: boolean; style: string; sortOrder: number };

/** Cosmetic items. `style` keys are rendered by src/lib/cosmetics.ts. */
export const shopItems: ShopSeed[] = [
  { code: "pro_pass_30", kind: "PRO_PASS", style: "pro", sortOrder: 0, price: 500, name: { uz: "Pro — 30 kun", en: "Pro — 30 days", ru: "Pro — 30 дней" } },

  { code: "frame_teal", kind: "FRAME", style: "teal", sortOrder: 1, price: 60, name: { uz: "Firuza halqa", en: "Teal ring", ru: "Бирюзовое кольцо" } },
  { code: "frame_sunrise", kind: "FRAME", style: "sunrise", sortOrder: 2, price: 120, name: { uz: "Tong shafagʻi", en: "Sunrise", ru: "Рассвет" } },
  { code: "frame_mint", kind: "FRAME", style: "mint", sortOrder: 3, price: 120, name: { uz: "Yalpiz bargi", en: "Mint leaf", ru: "Мятный лист" } },
  { code: "frame_night", kind: "FRAME", style: "night", sortOrder: 4, price: 200, name: { uz: "Tungi osmon", en: "Night sky", ru: "Ночное небо" } },
  { code: "frame_gold", kind: "FRAME", style: "gold", sortOrder: 5, price: 300, proOnly: true, name: { uz: "Oltin chempion", en: "Golden champion", ru: "Золотой чемпион" } },
  { code: "frame_aurora", kind: "FRAME", style: "aurora", sortOrder: 6, price: 400, proOnly: true, name: { uz: "Qutb shafagʻi", en: "Aurora", ru: "Северное сияние" } },

  { code: "banner_ocean", kind: "BANNER", style: "ocean", sortOrder: 10, price: 80, name: { uz: "Okean", en: "Ocean", ru: "Океан" } },
  { code: "banner_sunset", kind: "BANNER", style: "sunset", sortOrder: 11, price: 120, name: { uz: "Quyosh botishi", en: "Sunset", ru: "Закат" } },
  { code: "banner_forest", kind: "BANNER", style: "forest", sortOrder: 12, price: 120, name: { uz: "Oʻrmon", en: "Forest", ru: "Лес" } },
  { code: "banner_mountains", kind: "BANNER", style: "mountains", sortOrder: 13, price: 200, name: { uz: "Togʻlar", en: "Mountains", ru: "Горы" } },
  { code: "banner_galaxy", kind: "BANNER", style: "galaxy", sortOrder: 14, price: 350, proOnly: true, name: { uz: "Galaktika", en: "Galaxy", ru: "Галактика" } },

  { code: "name_teal", kind: "NAME_COLOR", style: "teal", sortOrder: 20, price: 50, name: { uz: "Firuza ism", en: "Teal name", ru: "Бирюзовое имя" } },
  { code: "name_coral", kind: "NAME_COLOR", style: "coral", sortOrder: 21, price: 50, name: { uz: "Marjon ism", en: "Coral name", ru: "Коралловое имя" } },
  { code: "name_violet", kind: "NAME_COLOR", style: "violet", sortOrder: 22, price: 80, name: { uz: "Binafsha ism", en: "Violet name", ru: "Фиолетовое имя" } },
  { code: "name_rainbow", kind: "NAME_COLOR", style: "rainbow", sortOrder: 23, price: 250, proOnly: true, name: { uz: "Kamalak ism", en: "Rainbow name", ru: "Радужное имя" } },

  { code: "badge_runner", kind: "BADGE", style: "runner", sortOrder: 30, price: 70, name: { uz: "Yuguruvchi", en: "Runner", ru: "Бегун" } },
  { code: "badge_sleeper", kind: "BADGE", style: "sleeper", sortOrder: 31, price: 70, name: { uz: "Yaxshi uyqu", en: "Good sleeper", ru: "Крепкий сон" } },
  { code: "badge_chef", kind: "BADGE", style: "chef", sortOrder: 32, price: 70, name: { uz: "Sogʻlom oshpaz", en: "Healthy chef", ru: "Здоровый повар" } },
  { code: "badge_scholar", kind: "BADGE", style: "scholar", sortOrder: 33, price: 90, name: { uz: "Bilimdon", en: "Scholar", ru: "Знаток" } },
  { code: "badge_crown", kind: "BADGE", style: "crown", sortOrder: 34, price: 300, proOnly: true, name: { uz: "Toj", en: "Crown", ru: "Корона" } },
];
