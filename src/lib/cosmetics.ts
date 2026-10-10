/** Visual definitions for shop cosmetics (keyed by ShopItem.style). Pure data — safe on server and client. */

export const FRAMES: Record<string, string> = {
  teal: "linear-gradient(135deg,#14B8A6,#0F766E)",
  sunrise: "linear-gradient(135deg,#F59E0B,#EF4444,#EC4899)",
  mint: "linear-gradient(135deg,#86EFAC,#10B981,#047857)",
  night: "linear-gradient(135deg,#1E3A8A,#6366F1,#0EA5E9)",
  gold: "conic-gradient(from 0deg,#FDE68A,#F59E0B,#B45309,#FDE68A,#F59E0B,#FDE68A)",
  aurora: "conic-gradient(from 90deg,#22D3EE,#A78BFA,#34D399,#F472B6,#22D3EE)",
  ocean: "linear-gradient(135deg,#38BDF8,#2563EB)",
  fire: "linear-gradient(135deg,#FDE047,#F97316,#DC2626)",
  lime: "linear-gradient(135deg,#D9F99D,#65A30D)",
  candy: "linear-gradient(135deg,#F9A8D4,#C084FC,#818CF8)",
  ice: "linear-gradient(135deg,#ECFEFF,#67E8F9,#0891B2)",
  rose: "linear-gradient(135deg,#FECDD3,#F43F5E,#9F1239)",
  steel: "linear-gradient(135deg,#E2E8F0,#64748B,#1E293B)",
  neon: "conic-gradient(from 0deg,#22D3EE,#A3E635,#F472B6,#22D3EE)",
  vortex: "conic-gradient(from 0deg,#7C3AED,#0EA5E9,#7C3AED,#F43F5E,#7C3AED)",
  diamond: "conic-gradient(from 30deg,#F0F9FF,#BAE6FD,#E0E7FF,#F5D0FE,#F0F9FF)",
  lava: "conic-gradient(from 0deg,#7F1D1D,#F97316,#FDE047,#F97316,#7F1D1D)",
};

/** Frames that slowly rotate (Pro perk). */
export const ANIMATED_FRAMES = new Set(["neon", "vortex", "lava"]);

export const BANNERS: Record<string, string> = {
  default: "linear-gradient(120deg,#0F766E,#14B8A6)",
  ocean: "linear-gradient(120deg,#0EA5E9,#2563EB 60%,#1E3A8A)",
  sunset: "linear-gradient(120deg,#F97316,#EC4899 55%,#7C3AED)",
  forest: "linear-gradient(120deg,#14532D,#16A34A 60%,#A3E635)",
  mountains: "linear-gradient(160deg,#CBD5E1 0%,#64748B 35%,#334155 70%,#0F172A)",
  galaxy: "radial-gradient(circle at 20% 30%,#A78BFA 0,transparent 30%),radial-gradient(circle at 80% 60%,#22D3EE 0,transparent 25%),linear-gradient(120deg,#0B1220,#312E81)",
  desert: "linear-gradient(170deg,#FDE68A 0%,#F59E0B 45%,#B45309 100%)",
  sakura: "linear-gradient(120deg,#FFF1F2,#FBCFE8 45%,#F472B6)",
  lagoon: "linear-gradient(120deg,#99F6E4,#2DD4BF 45%,#0F766E)",
  dusk: "linear-gradient(180deg,#1E1B4B,#7C3AED 55%,#F472B6)",
  candy: "repeating-linear-gradient(135deg,#F9A8D4 0 18px,#FBCFE8 18px 36px)",
  arctic: "linear-gradient(160deg,#F0F9FF,#BAE6FD 50%,#38BDF8)",
  stripes: "repeating-linear-gradient(90deg,#0F766E 0 24px,#14B8A6 24px 48px)",
  aurora: "radial-gradient(ellipse at 20% 0%,#34D399 0,transparent 55%),radial-gradient(ellipse at 80% 20%,#A78BFA 0,transparent 50%),linear-gradient(180deg,#022C22,#0B1220)",
  lava: "radial-gradient(circle at 30% 80%,#FDE047 0,transparent 30%),radial-gradient(circle at 70% 70%,#F97316 0,transparent 35%),linear-gradient(180deg,#1C1917,#7F1D1D)",
  neon: "linear-gradient(120deg,#0B1220 0%,#0B1220 30%,#22D3EE 30%,#22D3EE 33%,#0B1220 33%,#0B1220 60%,#F472B6 60%,#F472B6 63%,#0B1220 63%)",
};

/** Name colours: either a solid colour (readable in both themes) or a gradient text. */
export const NAME_COLORS: Record<string, { color?: string; gradient?: string }> = {
  teal: { color: "#0D9488" },
  coral: { color: "#E11D48" },
  violet: { color: "#7C3AED" },
  rainbow: { gradient: "linear-gradient(90deg,#EF4444,#F59E0B,#10B981,#3B82F6,#8B5CF6)" },
  amber: { color: "#D97706" },
  sky: { color: "#0284C7" },
  emerald: { color: "#059669" },
  pink: { color: "#DB2777" },
  indigo: { color: "#4F46E5" },
  gold: { gradient: "linear-gradient(90deg,#B45309,#F59E0B,#FDE047,#F59E0B,#B45309)" },
  fire: { gradient: "linear-gradient(90deg,#DC2626,#F97316,#FACC15)" },
  ocean: { gradient: "linear-gradient(90deg,#1D4ED8,#06B6D4,#14B8A6)" },
  aurora: { gradient: "linear-gradient(90deg,#10B981,#22D3EE,#A78BFA,#F472B6)" },
};

/** Badge styles: lucide icon name + background colour. */
export type BadgeIcon = "Footprints" | "Moon" | "ChefHat" | "GraduationCap" | "Crown" | "Dumbbell" | "Bike" | "Waves" | "Flame" | "Leaf" | "HeartPulse" | "Trophy" | "Zap" | "Star" | "Gem" | "Rocket";

export const BADGES: Record<string, { icon: BadgeIcon; bg: string }> = {
  runner: { icon: "Footprints", bg: "#0EA5E9" },
  sleeper: { icon: "Moon", bg: "#6366F1" },
  chef: { icon: "ChefHat", bg: "#F97316" },
  scholar: { icon: "GraduationCap", bg: "#10B981" },
  crown: { icon: "Crown", bg: "#D97706" },
  lifter: { icon: "Dumbbell", bg: "#0F766E" },
  cyclist: { icon: "Bike", bg: "#0369A1" },
  swimmer: { icon: "Waves", bg: "#2563EB" },
  streak: { icon: "Flame", bg: "#EA580C" },
  green: { icon: "Leaf", bg: "#16A34A" },
  heart: { icon: "HeartPulse", bg: "#E11D48" },
  champion: { icon: "Trophy", bg: "#CA8A04" },
  energy: { icon: "Zap", bg: "#7C3AED" },
  star: { icon: "Star", bg: "linear-gradient(135deg,#F59E0B,#EF4444)" },
  gem: { icon: "Gem", bg: "linear-gradient(135deg,#22D3EE,#A78BFA,#F472B6)" },
  rocket: { icon: "Rocket", bg: "linear-gradient(135deg,#1E3A8A,#6366F1)" },
};

/** Equipped item codes look like "frame_gold"; their style key is stored in ShopItem.style.
 *  To avoid an extra query we use the code suffix, which matches the style by convention. */
export function styleFromCode(code: string | null | undefined): string | null {
  if (!code) return null;
  const i = code.indexOf("_");
  return i === -1 ? code : code.slice(i + 1);
}
