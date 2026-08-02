import type { HabitColor } from "@/db/database.type";

export const REPO_URL = "https://github.com/sushilburagute/habits";

/** The four habits the hero grid draws, mirroring the demo data in `src/db/seed.ts`. */
export const HERO_HABITS: Array<{ name: string; color: HabitColor }> = [
  { name: "Morning Run", color: "emerald" },
  { name: "Meditation", color: "violet" },
  { name: "Hydrate 2L", color: "blue" },
  { name: "Read 20 Pages", color: "amber" },
];
