import {
  Apple, Bike, Bird, Cat, Coffee, Crown, Dog, Dumbbell, Fish, Flame, Flower2, Footprints, Gamepad2, Gem, Heart, HeartPulse,
  Leaf, Medal, Moon, Mountain, Music, Orbit, PawPrint, Rabbit, Rainbow, Rocket, Shield, Snowflake, Sparkles, Squirrel, Star,
  Sun, Swords, Target, TreePine, Trophy, Turtle, Volleyball, Waves, Zap,
} from "lucide-react";
import type { AvatarIcon, AvatarPreset } from "@/lib/avatars";

const ICONS: Record<AvatarIcon, typeof Apple> = {
  Apple, Bike, Bird, Cat, Coffee, Crown, Dog, Dumbbell, Fish, Flame, Flower2, Footprints, Gamepad2, Gem, Heart, HeartPulse,
  Leaf, Medal, Moon, Mountain, Music, Orbit, PawPrint, Rabbit, Rainbow, Rocket, Shield, Snowflake, Sparkles, Squirrel, Star,
  Sun, Swords, Target, TreePine, Trophy, Turtle, Volleyball, Waves, Zap,
};

/** Fills its (round) parent with the preset's background and a white icon. */
export function PresetAvatarArt({ preset }: { preset: AvatarPreset }) {
  const Icon = ICONS[preset.icon];
  return (
    <span className="flex h-full w-full items-center justify-center text-white" style={{ background: preset.bg }}>
      <Icon className="h-[56%] w-[56%] drop-shadow-sm" strokeWidth={1.8} aria-hidden />
    </span>
  );
}
