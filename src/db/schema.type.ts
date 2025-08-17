import type { DBSchema } from "idb";
import type { AppMeta, DailyTick, Habit, HabitId, ISODateDay } from "./database.type";

export interface HabitsDB extends DBSchema {
  habits: {
    key: HabitId;
    value: Habit;
    indexes: {
      byName: string;
      bySort: number;
    };
  };
  ticks: {
    key: [HabitId, ISODateDay];
    value: DailyTick;
    indexes: {
      byHabitDate: [HabitId, ISODateDay];
      byDateHabit: [ISODateDay, HabitId];
    };
  };
  meta: {
    key: string; // "app"
    value: AppMeta;
  };
}
