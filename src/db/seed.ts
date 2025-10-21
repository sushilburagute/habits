import { createHabit, getAllHabits, setTick } from "./repo";
import type { Habit, HabitId } from "./database.type";
import { localDayISO } from "./time";

type HabitSeedDefinition = {
  name: string;
  color: Habit["color"];
  targetPerDay?: number;
  days: number;
  generator: (date: Date, offset: number) => number;
};

export async function seedExample() {
  const existing = await getAllHabits();
  const registry = new Map(existing.map((habit) => [habit.name, habit]));

  const seeds: Array<HabitSeedDefinition> = [
    {
      name: "Morning Run",
      color: "emerald",
      targetPerDay: 1,
      days: 210,
      generator: (date) => {
        const day = date.getDay(); // 0 = Sunday
        return day === 0 ? 0 : 1;
      },
    },
    {
      name: "Meditation Breathwork",
      color: "violet",
      targetPerDay: 1,
      days: 160,
      generator: (_date, offset) => (offset % 2 === 0 ? 1 : 0),
    },
    {
      name: "Hydrate 2L",
      color: "blue",
      targetPerDay: 2,
      days: 120,
      generator: (_date, offset) => (offset % 3 === 0 ? 2 : 1),
    },
    {
      name: "Strength Training",
      color: "red",
      targetPerDay: 1,
      days: 90,
      generator: (date) => {
        const day = date.getDay();
        return day === 2 || day === 4 || day === 6 ? 1 : 0;
      },
    },
    {
      name: "Read 20 Pages",
      color: "amber",
      targetPerDay: 1,
      days: 365,
      generator: (date, offset) => {
        const day = date.getDay();
        if (day === 0) return offset % 4 === 0 ? 2 : 1;
        if (day === 6) return offset % 3 === 0 ? 2 : 1;
        return 1;
      },
    },
  ];

  for (const seed of seeds) {
    const habit = await ensureHabit(seed, registry);
    await seedRange(habit.id, seed.days, seed.generator);
  }
}

async function ensureHabit(definition: HabitSeedDefinition, registry: Map<string, Habit>) {
  const existing = registry.get(definition.name);
  if (existing) return existing;
  const habit = await createHabit({
    name: definition.name,
    color: definition.color,
    targetPerDay: definition.targetPerDay,
  });
  registry.set(definition.name, habit);
  return habit;
}

async function seedRange(
  habitId: HabitId,
  days: number,
  generator: (date: Date, offset: number) => number
) {
  const today = new Date();
  today.setHours(12, 0, 0, 0); // anchor at midday to avoid DST drift

  for (let offset = days - 1; offset >= 0; offset--) {
    const day = new Date(today);
    day.setDate(today.getDate() - offset);
    const value = generator(day, days - 1 - offset);
    if (value > 0) {
      await setTick(habitId, localDayISO(day), value);
    }
  }
}
