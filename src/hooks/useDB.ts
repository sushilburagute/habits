import { useEffect, useState } from "react";
import { onDBEvent } from "../db/sync";
import { getAllHabits, getMonthMap, computeStreaks, getAllToday, getRangeMap } from "../db/repo";
import type { Habit, HabitId } from "../db/database.type";
import { localDayISO } from "../db/time";

export function useHabits(): { habits: Array<Habit>; isLoading: boolean } {
  const [habits, setHabits] = useState<Array<Habit>>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    let mounted = true;
    let isInitialLoad = true;
    const load = async () => {
      if (isInitialLoad) setIsLoading(true);
      const list = await getAllHabits();
      if (!mounted) return;
      setHabits(list);
      setIsLoading(false);
      isInitialLoad = false;
    };
    void load();
    const off1 = onDBEvent("habit:created", () => void load());
    const off2 = onDBEvent("habit:updated", () => void load());
    return () => {
      mounted = false;
      off1();
      off2();
    };
  }, []);
  return { habits, isLoading };
}

export function useMonthMap(habitId: HabitId, year: number, month1to12: number) {
  const [map, setMap] = useState<Record<string, number>>({});
  useEffect(() => {
    let mounted = true;
    getMonthMap(habitId, year, month1to12).then((m) => mounted && setMap(m));
    const off = onDBEvent("tick:changed", (key) => {
      if (key.startsWith(`${habitId}:`))
        getMonthMap(habitId, year, month1to12).then((m) => mounted && setMap(m));
    });
    return () => {
      mounted = false;
      off();
    };
  }, [habitId, year, month1to12]);
  return map;
}

export function useStreaks(habitId: HabitId) {
  const [s, setS] = useState<{ current: number; longest: number }>({ current: 0, longest: 0 });
  useEffect(() => {
    let mounted = true;
    computeStreaks(habitId).then((x) => mounted && setS(x));
    const off = onDBEvent("tick:changed", (key) => {
      if (key.startsWith(`${habitId}:`)) computeStreaks(habitId).then((x) => mounted && setS(x));
    });
    return () => {
      mounted = false;
      off();
    };
  }, [habitId]);
  return s;
}

export function useTodaySummary() {
  const [rows, setRows] = useState<Array<{ habitId: HabitId; count: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    let mounted = true;
    let isInitialLoad = true;
    const load = async () => {
      if (isInitialLoad) setIsLoading(true);
      const result = await getAllToday();
      if (!mounted) return;
      setRows(result);
      setIsLoading(false);
      isInitialLoad = false;
    };
    void load();
    const off = onDBEvent("tick:changed", () => void load());
    return () => {
      mounted = false;
      off();
    };
  }, []);
  return { rows, isLoading };
}

export function useRangeMap(habitId: HabitId, start: Date, end: Date) {
  const [map, setMap] = useState<Record<string, number>>({});
  const startISO = localDayISO(start);
  const endISO = localDayISO(end);
  useEffect(() => {
    let mounted = true;
    getRangeMap(habitId, startISO, endISO).then((m) => mounted && setMap(m));
    const off = onDBEvent("tick:changed", (key) => {
      if (key.startsWith(`${habitId}:`))
        getRangeMap(habitId, startISO, endISO).then((m) => mounted && setMap(m));
    });
    return () => {
      mounted = false;
      off();
    };
  }, [habitId, startISO, endISO]);
  return map;
}
