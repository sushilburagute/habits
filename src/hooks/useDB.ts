import { useEffect, useState } from "react";
import { onDBEvent } from "../db/sync";
import { getAllHabits, getMonthMap, computeStreaks, getAllToday, getRangeMap } from "../db/repo";
import type { Habit, HabitId } from "../db/database.type";
import { localDayISO } from "../db/time";

export function useHabits(): Array<Habit> {
  const [list, setList] = useState<Array<Habit>>([]);
  useEffect(() => {
    let mounted = true;
    getAllHabits().then((r) => mounted && setList(r));
    const off1 = onDBEvent("habit:created", () =>
      getAllHabits().then((r) => mounted && setList(r))
    );
    const off2 = onDBEvent("habit:updated", () =>
      getAllHabits().then((r) => mounted && setList(r))
    );
    return () => {
      mounted = false;
      off1();
      off2();
    };
  }, []);
  return list;
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
  useEffect(() => {
    let mounted = true;
    getAllToday().then((r) => mounted && setRows(r));
    const off = onDBEvent("tick:changed", () => getAllToday().then((r) => mounted && setRows(r)));
    return () => {
      mounted = false;
      off();
    };
  }, []);
  return rows;
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
