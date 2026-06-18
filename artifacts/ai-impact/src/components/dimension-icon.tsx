import { HeartPulse, Heart, Brain, Users, Compass, Briefcase, Leaf, type LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  HeartPulse,
  Heart,
  Brain,
  Users,
  Compass,
  Briefcase,
  Leaf,
};

/** Maps a Seven-Dimensions icon name (from wellness.ts) to its lucide component. */
export function dimensionIcon(name: string): LucideIcon {
  return ICONS[name] ?? Leaf;
}
