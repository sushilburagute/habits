export type HabitId = string;
export type ISODateDay = string; // "YYYY-MM-DD" in the user's local timezone

export type HabitColor = "blue" | "emerald" | "violet" | "amber" | "rose" | "red" | "teal";

export interface Habit {
  id: HabitId;
  name: string;
  color: HabitColor;
  targetPerDay?: number;
  sortOrder: number;
  createdAt: number; // epoch ms
  updatedAt: number; // epoch ms
}

export interface DailyTick {
  habitId: HabitId;
  date: ISODateDay;
  count: number;
}

export interface AppMeta {
  key: "app-habits";
  dbVersion: number;
  timezone: string;
  appToken?: string;
}
