import { useEffect, useMemo, useState } from "react";
import type { Habit } from "@/db/database.type";
import { computeStreaks, getAllTicks } from "@/db/repo";
import { onDBEvent } from "@/db/sync";
import { localDayISO } from "@/db/time";

type LeaderboardEntry = {
  habit: Habit;
  current: number;
  longest: number;
  lastMarkedOn?: string;
};

type TimelinePoint = {
  period: string;
  start: string;
  end: string;
  total: number;
  delta: number | null;
};

type AtRiskEntry = {
  habit: Habit;
  streakLength: number;
  lastMarkedOn: string;
  daysSinceLast: number;
};

type InsightTimeline = {
  weeks: Array<TimelinePoint>;
  months: Array<TimelinePoint>;
  atRisk: Array<AtRiskEntry>;
};

export type StatsSummary = {
  totalHabits: number;
  totalCompletions: number;
  completionsLast30: number;
  activeDays: number;
  longestStreak?: LeaderboardEntry;
  leaderboard: Array<LeaderboardEntry>;
  lastEntryDate?: string;
  timeline: InsightTimeline;
};

const EMPTY_SUMMARY: StatsSummary = {
  totalHabits: 0,
  totalCompletions: 0,
  completionsLast30: 0,
  activeDays: 0,
  leaderboard: [],
  timeline: { weeks: [], months: [], atRisk: [] },
};

export function useStatsSummary(habits: Array<Habit>) {
  const [summary, setSummary] = useState<StatsSummary>(EMPTY_SUMMARY);
  const [isLoading, setIsLoading] = useState(true);

  const habitKey = useMemo(() => habits.map((h) => h.id).join("|"), [habits]);

  useEffect(() => {
    let mounted = true;
    let isInitialLoad = true;

    async function recompute() {
      if (!mounted) return;
      if (!habits.length) {
        setSummary(EMPTY_SUMMARY);
        setIsLoading(false);
        isInitialLoad = false;
        return;
      }

      if (isInitialLoad) setIsLoading(true);

      const [ticks, streaks] = await Promise.all([
        getAllTicks(),
        Promise.all(
          habits.map(async (habit) => {
            const stats = await computeStreaks(habit.id);
            return { habit, ...stats };
          })
        ),
      ]);

      if (!mounted) return;

      const weekTotals = new Map<string, number>();
      const monthTotals = new Map<string, number>();
      const habitCheckins = new Map<string, Set<string>>();

      const totalCompletions = ticks.reduce((sum, tick) => {
        const tickDate = dateFromISO(tick.date);
        const weekKey = startOfWeekISO(tickDate);
        weekTotals.set(weekKey, (weekTotals.get(weekKey) ?? 0) + tick.count);

        const monthKey = tick.date.slice(0, 7);
        monthTotals.set(monthKey, (monthTotals.get(monthKey) ?? 0) + tick.count);

        const dates = habitCheckins.get(tick.habitId) ?? new Set<string>();
        dates.add(tick.date);
        habitCheckins.set(tick.habitId, dates);

        return sum + tick.count;
      }, 0);

      const activeDays = new Set(ticks.map((tick) => tick.date)).size;
      const lastEntryDate = ticks.reduce<string | undefined>((latest, tick) => {
        if (!latest || tick.date > latest) return tick.date;
        return latest;
      }, undefined);

      const rangeStartDate = new Date();
      rangeStartDate.setDate(rangeStartDate.getDate() - 29);
      const rangeStartISO = localDayISO(rangeStartDate);
      const completionsLast30 = ticks.reduce((sum, tick) => {
        return tick.date >= rangeStartISO ? sum + tick.count : sum;
      }, 0);

      const leaderboard = streaks
        .map(({ habit, current, longest, lastMarkedOn }) => ({
          habit,
          current,
          longest,
          lastMarkedOn,
        }))
        .sort((a, b) => {
          if (b.current !== a.current) return b.current - a.current;
          return b.longest - a.longest;
        })
        .slice(0, 5);

      const longestStreak = streaks.reduce<LeaderboardEntry | undefined>((best, entry) => {
        if (!best || entry.longest > best.longest) {
          return {
            habit: entry.habit,
            current: entry.current,
            longest: entry.longest,
            lastMarkedOn: entry.lastMarkedOn,
          };
        }
        return best;
      }, undefined);

      const timeline = computeTimeline({
        weekTotals,
        monthTotals,
        habitCheckins,
        habits,
      });

      setSummary({
        totalHabits: habits.length,
        totalCompletions,
        completionsLast30,
        activeDays,
        longestStreak,
        leaderboard,
        lastEntryDate,
        timeline,
      });
      setIsLoading(false);
      isInitialLoad = false;
    }

    void recompute();

    const offHabitCreated = onDBEvent("habit:created", () => void recompute());
    const offHabitUpdated = onDBEvent("habit:updated", () => void recompute());
    const offTickChanged = onDBEvent("tick:changed", () => void recompute());

    return () => {
      mounted = false;
      offHabitCreated();
      offHabitUpdated();
      offTickChanged();
    };
  }, [habitKey, habits]);

  return { summary, isLoading };
}

function computeTimeline({
  weekTotals,
  monthTotals,
  habitCheckins,
  habits,
}: {
  weekTotals: Map<string, number>;
  monthTotals: Map<string, number>;
  habitCheckins: Map<string, Set<string>>;
  habits: Array<Habit>;
}): InsightTimeline {
  const today = new Date();
  const todayISO = localDayISO(today);
  const todayDate = dateFromISO(todayISO);

  const currentWeekStart = startOfWeekDate(todayDate);
  const weeks: Array<TimelinePoint> = [];
  for (let offset = 7; offset >= 0; offset -= 1) {
    const start = new Date(currentWeekStart);
    start.setDate(start.getDate() - offset * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    const startISO = localDayISO(start);
    const total = weekTotals.get(startISO) ?? 0;
    weeks.push({
      period: startISO,
      start: startISO,
      end: localDayISO(end),
      total,
      delta: null,
    });
  }
  for (let i = 1; i < weeks.length; i += 1) {
    weeks[i] = {
      ...weeks[i],
      delta: weeks[i].total - weeks[i - 1].total,
    };
  }

  const currentMonthStart = startOfMonth(todayDate);
  const months: Array<TimelinePoint> = [];
  for (let offset = 5; offset >= 0; offset -= 1) {
    const start = new Date(currentMonthStart);
    start.setMonth(start.getMonth() - offset);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
    const monthKey = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}`;
    months.push({
      period: monthKey,
      start: localDayISO(start),
      end: localDayISO(end),
      total: monthTotals.get(monthKey) ?? 0,
      delta: null,
    });
  }
  for (let i = 1; i < months.length; i += 1) {
    months[i] = {
      ...months[i],
      delta: months[i].total - months[i - 1].total,
    };
  }

  const yesterday = new Date(todayDate);
  yesterday.setDate(yesterday.getDate() - 1);

  const atRisk = habits
    .map((habit) => {
      const dates = habitCheckins.get(habit.id);
      if (!dates || dates.size === 0) return undefined;
      if (dates.has(todayISO)) return undefined;

      const run = computeRunEndingOn(yesterday, dates);
      if (run.length === 0 || !run.lastDate) return undefined;

      const daysSinceLast = diffInDays(todayDate, dateFromISO(run.lastDate));
      return {
        habit,
        streakLength: run.length,
        lastMarkedOn: run.lastDate,
        daysSinceLast,
      };
    })
    .filter((entry): entry is AtRiskEntry => entry !== undefined)
    .sort((a, b) => {
      if (b.streakLength !== a.streakLength) return b.streakLength - a.streakLength;
      if (a.lastMarkedOn && b.lastMarkedOn) return b.lastMarkedOn.localeCompare(a.lastMarkedOn);
      if (a.lastMarkedOn) return -1;
      if (b.lastMarkedOn) return 1;
      return 0;
    })
    .slice(0, 3);

  return {
    weeks,
    months,
    atRisk,
  };
}

function startOfWeekDate(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const day = start.getDay();
  start.setDate(start.getDate() - day);
  return start;
}

function startOfWeekISO(date: Date) {
  return localDayISO(startOfWeekDate(date));
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function computeRunEndingOn(endDate: Date, dates: Set<string>) {
  const cursor = new Date(endDate);
  let length = 0;
  let lastDate: string | undefined;
  while (true) {
    const iso = localDayISO(cursor);
    if (!dates.has(iso)) break;
    if (!lastDate) lastDate = iso;
    length += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return { length, lastDate };
}

function diffInDays(later: Date, earlier: Date) {
  const MS_IN_DAY = 1000 * 60 * 60 * 24;
  return Math.round((later.getTime() - earlier.getTime()) / MS_IN_DAY);
}

function dateFromISO(iso: string) {
  return new Date(`${iso}T00:00:00`);
}
