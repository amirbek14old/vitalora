import { Award, BedDouble, BookOpen, Dumbbell, Flame, GraduationCap, Leaf, MessageCircleHeart, Moon, Salad, Sprout, Star, type LucideIcon } from "lucide-react";

const map: Record<string, LucideIcon> = { Dumbbell, Flame, Moon, BedDouble, Sprout, Leaf, BookOpen, Star, GraduationCap, Salad, MessageCircleHeart };

export function AchievementIcon({ name, className }: { name: string; className?: string }) {
  const Icon = map[name] ?? Award;
  return <Icon className={className} aria-hidden />;
}
