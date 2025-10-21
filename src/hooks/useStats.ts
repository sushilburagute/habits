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

export type StatsSummary = {
  totalHabits: number;
  totalCompletions: number;
  completionsLast30: number;
  activeDays: number;
  longestStreak?: LeaderboardEntry;
  leaderboard: Array<LeaderboardEntry>;
  lastEntryDate?: string;
};

const EMPTY_SUMMARY: StatsSummary = {
  totalHabits: 0,
  totalCompletions: 0,
  completionsLast30: 0,
  activeDays: 0,
  leaderboard: [],
};

export function useStatsSummary(habits: Array<Habit>) {
  const [summary, setSummary] = useState<StatsSummary>(EMPTY_SUMMARY);

  const habitKey = useMemo(() => habits.map((h) => h.id).join("|"), [habits]);

  useEffect(() => {
    let mounted = true;

    async function recompute() {
      if (!mounted) return;
      if (!habits.length) {
        setSummary(EMPTY_SUMMARY);
        return;
      }

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

      const totalCompletions = ticks.reduce((sum, tick) => sum + tick.count, 0);
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

      setSummary({
        totalHabits: habits.length,
        totalCompletions,
        completionsLast30,
        activeDays,
        longestStreak,
        leaderboard,
        lastEntryDate,
      });
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

  return summary;
}

