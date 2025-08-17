export type HabitId = string;
export type ISODateDay = string; // "YYYY-MM-DD" in the user's local timezone

export interface Habit {
  id: HabitId;
  name: string;
  color: string;
  targetPerDay?: number;
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
