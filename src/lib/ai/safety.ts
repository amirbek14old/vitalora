import type { Locale } from "@/lib/i18n/config";

/**
 * Deterministic safety guardrails that run BEFORE and AFTER the language model.
 * They are intentionally conservative and are covered by unit tests.
 * They complement — not replace — the safety rules in the system prompt.
 */

export type SafetyCategory = "self_harm" | "emergency" | "disordered_eating" | "medication";

type Rule = { category: SafetyCategory; patterns: RegExp[] };

const rules: Rule[] = [
  {
    category: "self_harm",
    patterns: [
      /\b(kill|hurt|harm)\s+myself\b/i,
      /\bsuicid/i,
      /\bwant\s+to\s+die\b/i,
      /\bend\s+my\s+life\b/i,
      /\bself[-\s]?harm/i,
      /oʻ?z(im)?ni\s+oʻ?ldir/i,
      /o['ʻ’]?zimni\s+o['ʻ’]?ldir/i,
      /yashagim\s+kelmayapti/i,
      /o['ʻ’]?z\s*joniga\s*qasd/i,
      /суицид/i,
      /покончить\s+с\s+собой/i,
      /убить\s+себя/i,
      /не\s+хочу\s+жить/i,
      /причин(ить|яю)\s+себе\s+вред/i,
    ],
  },
  {
    category: "emergency",
    patterns: [
      /\bchest\s+pain\b/i,
      /\b(can'?t|cannot)\s+breathe\b/i,
      /\bfainted\b|\bpassed\s+out\b/i,
      /ko['ʻ’]?krag(im)?\s*(da)?\s*og['ʻ’]?ri/i,
      /nafas\s+ola\s+olmayapman/i,
      /hushimdan\s+ketdim/i,
      /бол(ь|ит)\s+в\s+груди/i,
      /не\s+могу\s+дышать/i,
      /потерял(а)?\s+сознание/i,
    ],
  },
  {
    category: "disordered_eating",
    patterns: [
      /\b(starve|starving)\s+(myself)?/i,
      /\bstop\s+eating\b/i,
      /\b(make\s+myself\s+)?(throw\s+up|vomit|purge)\s+(after|to)\b/i,
      /\blaxatives?\b.*\b(weight|lose|slim)/i,
      /\b([1-7]\d{2}|[1-9]\d)\s*(kcal|calories|cal)\s*(a|per)\s*day\b/i,
      /och\s+qolib\s+ozish/i,
      /ovqat\s+yemaslik/i,
      /qusib\s+tashla/i,
      /голода(ть|ю|ние)\s+(чтобы|для)/i,
      /перестать\s+есть/i,
      /вызвать\s+рвоту/i,
      /слабительн/i,
    ],
  },
  {
    category: "medication",
    patterns: [
      /\b(dose|dosage)\b/i,
      /\bhow\s+many\s+(mg|milligrams|pills)\b/i,
      /\b(steroids?|anabolic|sarms?|clenbuterol)\b/i,
      /\bprescri(be|ption)\b/i,
      /\bdoza(si)?\b/i,
      /retsept(siz)?\s+dori/i,
      /\bсколько\s+(мг|таблеток)\b/i,
      /дозиров/i,
      /стероид|анабол/i,
    ],
  },
];

export function classifyInput(text: string): SafetyCategory | null {
  for (const rule of rules) {
    if (rule.patterns.some((p) => p.test(text))) return rule.category;
  }
  return null;
}

/** Categories handled with a fixed, supportive response instead of the language model. */
export function isBlockingCategory(c: SafetyCategory | null): c is "self_harm" | "emergency" | "disordered_eating" {
  return c === "self_harm" || c === "emergency" || c === "disordered_eating";
}

const safeResponses: Record<"self_harm" | "emergency" | "disordered_eating", Record<Locale, string>> = {
  self_harm: {
    en: "I'm really sorry you're feeling this way. You deserve support right now. Please contact local emergency services or a crisis line in your country, or reach out to someone you trust and tell them how you feel. I'm an educational assistant and can't provide crisis help, but you don't have to go through this alone.",
    uz: "Bunday his qilayotganingizdan juda afsusdaman. Siz hozir yordamga loyiqsiz. Iltimos, mahalliy tez yordam xizmatiga (Oʻzbekistonda 103 yoki 112) yoki yaqin ishonchli insoningizga murojaat qiling va his-tuygʻularingizni ayting. Men taʼlimiy yordamchiman va inqiroz holatida yordam bera olmayman, lekin siz bu bilan yolgʻiz emassiz.",
    ru: "Мне очень жаль, что вы так себя чувствуете. Вы заслуживаете поддержки прямо сейчас. Пожалуйста, обратитесь в местную экстренную службу или на линию кризисной помощи в вашей стране, либо расскажите о своих чувствах человеку, которому доверяете. Я образовательный ассистент и не могу оказать кризисную помощь, но вы не одни.",
  },
  emergency: {
    en: "What you describe could need urgent medical attention. Please stop any activity and contact local emergency services now, or ask someone nearby to help you. I can't assess symptoms.",
    uz: "Siz taʼriflagan holat shoshilinch tibbiy yordam talab qilishi mumkin. Iltimos, har qanday faoliyatni toʻxtating va hoziroq tez yordamga (103 yoki 112) qoʻngʻiroq qiling yoki yoningizdagilardan yordam soʻrang. Men alomatlarni baholay olmayman.",
    ru: "То, что вы описываете, может требовать срочной медицинской помощи. Пожалуйста, прекратите любую активность и сейчас же обратитесь в экстренную службу или попросите кого-то рядом помочь. Я не могу оценивать симптомы.",
  },
  disordered_eating: {
    en: "I can't help with extreme restriction, skipping meals to lose weight or purging — these can seriously harm your health. If food, eating or your body is causing you stress, please talk to a doctor, a registered dietitian or someone you trust. I'm happy to share information about balanced, regular meals and a kind relationship with food.",
    uz: "Qatʼiy cheklash, ozish uchun ovqatni tashlab ketish yoki qusish boʻyicha yordam bera olmayman — bular sogʻligʻingizga jiddiy zarar yetkazishi mumkin. Agar ovqat yoki tanangiz sizni bezovta qilayotgan boʻlsa, shifokor, dietolog yoki ishonchli insoningiz bilan gaplashing. Muvozanatli, muntazam ovqatlanish va ovqatga mehribon munosabat haqida bajonidil maʼlumot beraman.",
    ru: "Я не могу помочь с жёсткими ограничениями, пропуском приёмов пищи ради похудения или очищением — это может серьёзно навредить здоровью. Если еда или тело вызывают у вас стресс, поговорите с врачом, диетологом или человеком, которому доверяете. Я с радостью расскажу о сбалансированном регулярном питании и бережном отношении к еде.",
  },
};

export function safeResponse(category: "self_harm" | "emergency" | "disordered_eating", locale: Locale): string {
  return safeResponses[category][locale];
}

/**
 * Output guard: blocks model answers that recommend very-low daily energy intakes
 * (a common harmful pattern) and strips calorie numbers for teen accounts.
 */
export function guardOutput(text: string, opts: { locale: Locale; teen: boolean }): { text: string; flagged: SafetyCategory | null } {
  const veryLowIntake = /\b([1-9]\d{1,2}|1[01]\d{2})\s*(kcal|calories|kkal|ккал|калори[йя])\s*(a|per|in a|kuniga|в)?\s*(day|kun|день|сутки)\b/i;
  if (veryLowIntake.test(text)) {
    return { text: safeResponse("disordered_eating", opts.locale), flagged: "disordered_eating" };
  }
  if (opts.teen) {
    const stripped = text.replace(/\b\d{2,4}\s*(kcal|calories|kkal|ккал|калори[йя])\b/gi, "—");
    return { text: stripped, flagged: null };
  }
  return { text, flagged: null };
}
