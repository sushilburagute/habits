import type { HabitColor } from "@/db/database.type";

type HabitColorConfig = {
  label: string;
  hex: string;
};

export const HABIT_COLOR_CONFIG: Record<HabitColor, HabitColorConfig> = {
  blue: { label: "Blue", hex: "#2563eb" },
  emerald: { label: "Emerald", hex: "#059669" },
  violet: { label: "Violet", hex: "#7c3aed" },
  amber: { label: "Amber", hex: "#f59e0b" },
  rose: { label: "Rose", hex: "#f43f5e" },
  red: { label: "Crimson", hex: "#ef4444" },
  teal: { label: "Teal", hex: "#0d9488" },
};

export const HABIT_COLOR_CHOICES = Object.entries(HABIT_COLOR_CONFIG).map(([value, config]) => ({
  value: value as HabitColor,
  label: config.label,
  hex: config.hex,
}));
