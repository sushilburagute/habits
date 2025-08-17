import { createHabit, setTick } from "./repo";
import { localDayISO } from "./time";

export async function seedExample() {
  const helloHabits = await createHabit({
    name: "hello habits.",
    color: "blue",
    targetPerDay: 1,
  });

  const run = await createHabit({
    name: "create. track. update.",
    color: "red",
    targetPerDay: 1,
  });

  const today = new Date();
  for (let i = 0; i < 5; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    await setTick(helloHabits.id, localDayISO(d), 1);
  }
  await setTick(run.id, localDayISO(today), 1);
}
