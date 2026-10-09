/** Coin economy rules (shared by server and UI). Coins are earned only and cannot be bought. */
export type RewardRule = { amount: number; maxPerDay?: number; maxCoinsPerDay?: number };

export const REWARDS = {
  workout: { amount: 10, maxPerDay: 3 },
  form_check: { amount: 0, maxCoinsPerDay: 50 }, // amount = good reps (max 25 per session)
  sleep: { amount: 5, maxPerDay: 1 },
  habit: { amount: 2, maxPerDay: 10 },
  lesson: { amount: 15 },
  quiz_perfect: { amount: 10, maxPerDay: 5 },
  meal: { amount: 3, maxPerDay: 2 },
  achievement: { amount: 20 },
} satisfies Record<string, RewardRule>;

export type RewardReason = keyof typeof REWARDS;

export const PRO_PASS_DAYS = 30;
export const FORM_COINS_PER_SESSION = 25;

/** Pro doubles AI limits; everything essential stays free for everyone. */
export const PRO_LIMIT_MULTIPLIER = 2;
