/** Ready-made profile pictures (original icon art, safe for all ages). Pure data — safe on server and client.
 *  Stored in Profile.avatarPreset by key. Pro-only presets need an active Pro. */

export type AvatarIcon =
  | "Dumbbell" | "Bike" | "Footprints" | "Trophy" | "Medal" | "Waves" | "Mountain" | "Volleyball" | "Target" | "HeartPulse"
  | "Leaf" | "Sun" | "Moon" | "TreePine" | "Flower2" | "Snowflake" | "Flame" | "Zap" | "Rainbow" | "Apple"
  | "Cat" | "Dog" | "Bird" | "Fish" | "Rabbit" | "Turtle" | "Squirrel" | "PawPrint"
  | "Rocket" | "Star" | "Heart" | "Music" | "Gamepad2" | "Coffee"
  | "Gem" | "Crown" | "Sparkles" | "Orbit" | "Shield" | "Swords";

export type AvatarPreset = { key: string; icon: AvatarIcon; bg: string; group: "sport" | "nature" | "animals" | "fun" | "pro"; pro?: boolean };

const g = (a: string, b: string) => `linear-gradient(135deg,${a},${b})`;

export const AVATAR_PRESETS: AvatarPreset[] = [
  // Sport
  { key: "dumbbell", icon: "Dumbbell", bg: g("#0F766E", "#14B8A6"), group: "sport" },
  { key: "bike", icon: "Bike", bg: g("#0369A1", "#38BDF8"), group: "sport" },
  { key: "runner", icon: "Footprints", bg: g("#B45309", "#F59E0B"), group: "sport" },
  { key: "trophy", icon: "Trophy", bg: g("#A16207", "#FACC15"), group: "sport" },
  { key: "medal", icon: "Medal", bg: g("#BE123C", "#FB7185"), group: "sport" },
  { key: "swim", icon: "Waves", bg: g("#1D4ED8", "#60A5FA"), group: "sport" },
  { key: "hike", icon: "Mountain", bg: g("#334155", "#94A3B8"), group: "sport" },
  { key: "volley", icon: "Volleyball", bg: g("#C2410C", "#FDBA74"), group: "sport" },
  { key: "target", icon: "Target", bg: g("#B91C1C", "#F87171"), group: "sport" },
  { key: "pulse", icon: "HeartPulse", bg: g("#9D174D", "#F472B6"), group: "sport" },
  // Nature
  { key: "leaf", icon: "Leaf", bg: g("#15803D", "#4ADE80"), group: "nature" },
  { key: "sun", icon: "Sun", bg: g("#EA580C", "#FCD34D"), group: "nature" },
  { key: "moon", icon: "Moon", bg: g("#312E81", "#818CF8"), group: "nature" },
  { key: "pine", icon: "TreePine", bg: g("#14532D", "#22C55E"), group: "nature" },
  { key: "flower", icon: "Flower2", bg: g("#A21CAF", "#F0ABFC"), group: "nature" },
  { key: "snow", icon: "Snowflake", bg: g("#0E7490", "#A5F3FC"), group: "nature" },
  { key: "flame", icon: "Flame", bg: g("#B91C1C", "#FB923C"), group: "nature" },
  { key: "bolt", icon: "Zap", bg: g("#CA8A04", "#FDE047"), group: "nature" },
  { key: "rainbow", icon: "Rainbow", bg: g("#7C3AED", "#38BDF8"), group: "nature" },
  { key: "apple", icon: "Apple", bg: g("#DC2626", "#FCA5A5"), group: "nature" },
  // Animals
  { key: "cat", icon: "Cat", bg: g("#9A3412", "#FDBA74"), group: "animals" },
  { key: "dog", icon: "Dog", bg: g("#78350F", "#D97706"), group: "animals" },
  { key: "bird", icon: "Bird", bg: g("#0284C7", "#7DD3FC"), group: "animals" },
  { key: "fish", icon: "Fish", bg: g("#0E7490", "#22D3EE"), group: "animals" },
  { key: "rabbit", icon: "Rabbit", bg: g("#BE185D", "#F9A8D4"), group: "animals" },
  { key: "turtle", icon: "Turtle", bg: g("#047857", "#6EE7B7"), group: "animals" },
  { key: "squirrel", icon: "Squirrel", bg: g("#92400E", "#FBBF24"), group: "animals" },
  { key: "paw", icon: "PawPrint", bg: g("#4338CA", "#A5B4FC"), group: "animals" },
  // Fun
  { key: "rocket", icon: "Rocket", bg: g("#1E3A8A", "#6366F1"), group: "fun" },
  { key: "star", icon: "Star", bg: g("#B45309", "#FDE68A"), group: "fun" },
  { key: "heart", icon: "Heart", bg: g("#E11D48", "#FDA4AF"), group: "fun" },
  { key: "music", icon: "Music", bg: g("#6D28D9", "#C4B5FD"), group: "fun" },
  { key: "game", icon: "Gamepad2", bg: g("#0F172A", "#475569"), group: "fun" },
  { key: "coffee", icon: "Coffee", bg: g("#57534E", "#D6D3D1"), group: "fun" },
  // Pro
  { key: "gem", icon: "Gem", bg: "conic-gradient(from 45deg,#22D3EE,#A78BFA,#F472B6,#22D3EE)", group: "pro", pro: true },
  { key: "crown", icon: "Crown", bg: "conic-gradient(from 0deg,#FDE68A,#F59E0B,#B45309,#FDE68A)", group: "pro", pro: true },
  { key: "sparkles", icon: "Sparkles", bg: "radial-gradient(circle at 30% 30%,#F0ABFC,#7C3AED 70%)", group: "pro", pro: true },
  { key: "orbit", icon: "Orbit", bg: "radial-gradient(circle at 70% 30%,#22D3EE,#0B1220 75%)", group: "pro", pro: true },
  { key: "shield", icon: "Shield", bg: g("#111827", "#F59E0B"), group: "pro", pro: true },
  { key: "swords", icon: "Swords", bg: g("#7F1D1D", "#FBBF24"), group: "pro", pro: true },
];

export const AVATAR_PRESET_MAP: Record<string, AvatarPreset> = Object.fromEntries(AVATAR_PRESETS.map((p) => [p.key, p]));
export const AVATAR_GROUPS = ["sport", "nature", "animals", "fun", "pro"] as const;
