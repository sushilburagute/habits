import { getDB } from "./index";
import { emitDBEvent } from "./sync";
import { localDayISO } from "./time";
import type { Habit, HabitId, ISODateDay, DailyTick } from "./database.type";

// Habits
export async function createHabit(
  input: Pick<Habit, "name" | "color" | "targetPerDay">
): Promise<Habit> {
  const now = Date.now();
  const habit: Habit = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    color: input.color,
    targetPerDay: input.targetPerDay,
    createdAt: now,
    updatedAt: now,
  };
  const db = await getDB();
  await db.put("habits", habit);
  emitDBEvent("habit:created", habit.id);
  return habit;
}

export async function updateHabit(id: HabitId, patch: Partial<Omit<Habit, "id" | "createdAt">>) {
  const db = await getDB();
  const existing = await db.get("habits", id);
  if (!existing) return;
  const next: Habit = { ...existing, ...patch, updatedAt: Date.now() };
  await db.put("habits", next);
  emitDBEvent("habit:updated", id);
}

export async function getAllHabits(): Promise<Array<Habit>> {
  const db = await getDB();
  const tx = db.transaction("habits");
  const bySort = tx.store.index("bySort");
  return bySort.getAll(); // already sorted by sortOrder
}

// Ticks
export async function setTick(habitId: HabitId, day: ISODateDay, value: number) {
  const db = await getDB();
  if (value > 0) {
    const rec: DailyTick = { habitId, date: day, count: value };
    await db.put("ticks", rec);
  } else {
    await db.delete("ticks", [habitId, day]);
  }
  emitDBEvent("tick:changed", `${habitId}:${day}`);
}

export async function toggleToday(habitId: HabitId) {
  const day = localDayISO(new Date());
  const db = await getDB();
  const existing = await db.get("ticks", [habitId, day]);
  const next = existing && existing.count > 0 ? 0 : 1;
  await setTick(habitId, day, next);
  return next;
}

export async function getMonthMap(habitId: HabitId, year: number, month1to12: number) {
  const start = `${year}-${String(month1to12).padStart(2, "0")}-01`;
  const end = localDayISO(new Date(year, month1to12, 0)); // last day of month
  const db = await getDB();
  const range = IDBKeyRange.bound([habitId, start], [habitId, end]);
  const rows = await db.transaction("ticks").store.index("byHabitDate").getAll(range);
  const map: Record<ISODateDay, number> = {};
  for (const r of rows) map[r.date] = r.count;
  return map;
}

export async function getAllToday() {
  const db = await getDB();
  const today = localDayISO(new Date());
  const range = IDBKeyRange.bound([today, ""], [today, "\uffff"]);
  const rows = await db.transaction("ticks").store.index("byDateHabit").getAll(range);
  return rows.map((r) => ({ habitId: r.habitId, count: r.count }));
}

// Streaks
export async function computeStreaks(
  habitId: HabitId
): Promise<{ current: number; longest: number; lastMarkedOn?: ISODateDay }> {
  const db = await getDB();
  // naive, good enough for v1: walk backwards until a gap
  const today = localDayISO(new Date());
  const tx = db.transaction("ticks");
  const idx = tx.store.index("byHabitDate");

  // grab all ticks for habit - if this gets heavy, bound by last N months
  const range = IDBKeyRange.bound([habitId, ""], [habitId, "\uffff"]);
  const rows = await idx.getAll(range);
  const days = new Set(
    rows
      .filter((r) => r.count > 0)
      .map((r) => r.date)
      .sort()
  );

  let current = 0;
  let longest = 0;
  let lastMarkedOn: ISODateDay | undefined;

  // iterate days backwards from today
  const cursor = new Date(today);
  const step = () => cursor.setDate(cursor.getDate() - 1);
  const iso = () => localDayISO(cursor as unknown as Date);

  // track longest by scanning contiguous runs in sorted list
  // quick pass for current
  while (days.has(iso())) {
    if (!lastMarkedOn) lastMarkedOn = iso();
    current += 1;
    step();
  }

  // longest: linear scan
  let run = 0;
  let prev: ISODateDay | null = null;
  for (const d of Array.from(days).sort()) {
    if (!prev) {
      run = 1;
    } else {
      const p = new Date(prev);
      p.setDate(p.getDate() + 1);
      const nextIso = p.toISOString().slice(0, 10);
      run = d === nextIso ? run + 1 : 1;
    }
    longest = Math.max(longest, run);
    prev = d;
  }

  return { current, longest, lastMarkedOn };
}
