/** Visual definitions for shop cosmetics (keyed by ShopItem.style). Pure data — safe on server and client. */

export const FRAMES: Record<string, string> = {
  teal: "linear-gradient(135deg,#14B8A6,#0F766E)",
  sunrise: "linear-gradient(135deg,#F59E0B,#EF4444,#EC4899)",
  mint: "linear-gradient(135deg,#86EFAC,#10B981,#047857)",
  night: "linear-gradient(135deg,#1E3A8A,#6366F1,#0EA5E9)",
  gold: "conic-gradient(from 0deg,#FDE68A,#F59E0B,#B45309,#FDE68A,#F59E0B,#FDE68A)",
  aurora: "conic-gradient(from 90deg,#22D3EE,#A78BFA,#34D399,#F472B6,#22D3EE)",
};

export const BANNERS: Record<string, string> = {
  default: "linear-gradient(120deg,#0F766E,#14B8A6)",
  ocean: "linear-gradient(120deg,#0EA5E9,#2563EB 60%,#1E3A8A)",
  sunset: "linear-gradient(120deg,#F97316,#EC4899 55%,#7C3AED)",
  forest: "linear-gradient(120deg,#14532D,#16A34A 60%,#A3E635)",
  mountains: "linear-gradient(160deg,#CBD5E1 0%,#64748B 35%,#334155 70%,#0F172A)",
  galaxy: "radial-gradient(circle at 20% 30%,#A78BFA 0,transparent 30%),radial-gradient(circle at 80% 60%,#22D3EE 0,transparent 25%),linear-gradient(120deg,#0B1220,#312E81)",
};

/** Name colours: either a solid colour (readable in both themes) or a gradient text. */
export const NAME_COLORS: Record<string, { color?: string; gradient?: string }> = {
  teal: { color: "#0D9488" },
  coral: { color: "#E11D48" },
  violet: { color: "#7C3AED" },
  rainbow: { gradient: "linear-gradient(90deg,#EF4444,#F59E0B,#10B981,#3B82F6,#8B5CF6)" },
};

/** Badge styles: lucide icon name + background colour. */
export const BADGES: Record<string, { icon: "Footprints" | "Moon" | "ChefHat" | "GraduationCap" | "Crown"; bg: string }> = {
  runner: { icon: "Footprints", bg: "#0EA5E9" },
  sleeper: { icon: "Moon", bg: "#6366F1" },
  chef: { icon: "ChefHat", bg: "#F97316" },
  scholar: { icon: "GraduationCap", bg: "#10B981" },
  crown: { icon: "Crown", bg: "#D97706" },
};

/** Equipped item codes look like "frame_gold"; their style key is stored in ShopItem.style.
 *  To avoid an extra query we use the code suffix, which matches the style by convention. */
export function styleFromCode(code: string | null | undefined): string | null {
  if (!code) return null;
  const i = code.indexOf("_");
  return i === -1 ? code : code.slice(i + 1);
}
