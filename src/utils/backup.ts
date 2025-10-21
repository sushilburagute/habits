import { getDB } from "@/db";
import type { AppMeta, DailyTick, Habit } from "@/db/database.type";
import { emitDBEvent } from "@/db/sync";

export type HabitBackupPayload = {
  habits: Habit[];
  ticks: DailyTick[];
  meta?: AppMeta | null;
};

const BACKUP_VERSION = 1;

export async function createBackupPayload(): Promise<HabitBackupPayload> {
  const db = await getDB();
  const [habits, ticks, meta] = await Promise.all([
    db.getAll("habits"),
    db.getAll("ticks"),
    db.get("meta", "app-habits"),
  ]);
  return {
    habits,
    ticks,
    meta,
  };
}

export async function downloadBackup(filename = defaultFileName()) {
  const payload = await createBackupPayload();
  const withMetadata = {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    ...payload,
  };
  const blob = new Blob([JSON.stringify(withMetadata, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function importBackupFile(file: File) {
  const text = await file.text();
  const parsed = JSON.parse(text) as HabitBackupPayload & { version?: number };
  await restoreBackupPayload(parsed);
}

export async function restoreBackupPayload(payload: HabitBackupPayload) {
  const db = await getDB();
  const tx = db.transaction(["habits", "ticks", "meta"], "readwrite");
  await Promise.all([tx.objectStore("habits").clear(), tx.objectStore("ticks").clear()]);
  if (payload.habits?.length) {
    await Promise.all(
      payload.habits.map(async (habit, index) => {
        const next: Habit = {
          ...habit,
          sortOrder: habit.sortOrder ?? habit.createdAt ?? Date.now() + index,
          updatedAt: habit.updatedAt ?? Date.now(),
          createdAt: habit.createdAt ?? Date.now(),
        };
        return tx.objectStore("habits").put(next);
      })
    );
  }
  if (payload.ticks?.length) {
    await Promise.all(payload.ticks.map((tick) => tx.objectStore("ticks").put(tick)));
  }
  if (payload.meta) {
    await tx.objectStore("meta").put(payload.meta);
  }
  await tx.done;
  emitDBEvent("habit:created", "bulk-import");
  emitDBEvent("tick:changed", "bulk-import");
}

function defaultFileName() {
  const today = new Date().toISOString().slice(0, 10);
  return `habit-heatmap-${today}.json`;
}
