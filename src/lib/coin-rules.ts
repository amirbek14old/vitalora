/** Coin economy rules (shared by server and UI). Coins are earned only and cannot be bought with money. */
export type RewardRule = { amount: number; maxPerDay?: number; maxCoinsPerDay?: number; noProBonus?: boolean };

export const REWARDS = {
  // Manual workouts can't be verified, so they pay little and once a day.
  // Real effort is rewarded through the camera coach (form_check), which counts verified reps.
  workout: { amount: 5, maxPerDay: 1 },
  form_check: { amount: 0, maxCoinsPerDay: 50 }, // amount = good reps (max 25 per session)
  sleep: { amount: 5, maxPerDay: 1 },
  habit: { amount: 2, maxPerDay: 10 },
  lesson: { amount: 15 },
  achievement: { amount: 20 },
  // Pro perk: claim once a day on /pro (not doubled).
  pro_daily: { amount: 25, maxPerDay: 1, noProBonus: true },
} satisfies Record<string, RewardRule>;

export type RewardReason = keyof typeof REWARDS;

/** Two ways to get Pro: pay $5 (Payme/Click) for 14 days, or spend 500 coins for 3 days. */
export const PRO_PAID_DAYS = 14;
export const PRO_PRICE_USD = 5;
export const PRO_COIN_PASS_DAYS = 3;
export const PRO_COIN_PASS_PRICE = 500;
export const PRO_COIN_PASS_CODE = "pro_pass_3d";
/** Pro members earn double coins on every task (daily caps count tasks, so they still apply). */
export const PRO_COIN_MULTIPLIER = 2;
/** Pro members get a discount on every shop item. */
export const PRO_SHOP_DISCOUNT = 0.2;

export function shopPrice(price: number, pro: boolean): number {
  return pro ? Math.ceil(price * (1 - PRO_SHOP_DISCOUNT)) : price;
}
export const FORM_COINS_PER_SESSION = 25;
/** A manual workout earns coins only if it looks like a real session. */
export const WORKOUT_MIN_MINUTES_FOR_COINS = 10;

/** Pro doubles AI limits; everything essential stays free for everyone. */
export const PRO_LIMIT_MULTIPLIER = 2;
