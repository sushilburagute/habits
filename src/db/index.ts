import { openDB, type IDBPDatabase } from "idb";
import type { HabitsDB } from "./schema.type";

let dbPromise: Promise<IDBPDatabase<HabitsDB>>;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<HabitsDB>("habits", 1, {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      upgrade(db, oldVersion, _newVersion, _tx) {
        // v1
        if (oldVersion < 1) {
          const habits = db.createObjectStore("habits", { keyPath: "id" });
          habits.createIndex("byName", "name");
          habits.createIndex("bySort", "sortOrder");

          const ticks = db.createObjectStore("ticks", { keyPath: ["habitId", "date"] });
          ticks.createIndex("byHabitDate", ["habitId", "date"], { unique: true });
          ticks.createIndex("byDateHabit", ["date", "habitId"], { unique: true });

          const meta = db.createObjectStore("meta", { keyPath: "key" });
          meta.put({
            key: "app-habits",
            dbVersion: 1,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          });
        }
      },
    });
  }
  return dbPromise;
}
