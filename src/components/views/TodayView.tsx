import { useCallback, useMemo, useState } from "react";

import { useHabits, useTodaySummary } from "@/hooks/useDB";
import { toggleToday, decrementToday } from "@/db/repo";
import type { HabitId } from "@/db/database.type";
import { NoHabitsPlaceholder } from "@/components/NoHabitsPlaceholder";
import { TodaySwipeList } from "@/components/TodaySwipeList";
import { TodayHabitSkeleton } from "@/components/TodayHabitSkeleton";

type TodayViewProps = {
  onCreateRequest: () => void;
};

export function TodayView({ onCreateRequest }: TodayViewProps) {
  const { habits, isLoading: habitsLoading } = useHabits();
  const { rows: todaySummary, isLoading: summaryLoading } = useTodaySummary();
  const isLoading = habitsLoading || summaryLoading;
  const [pending, setPending] = useState<Record<HabitId, boolean>>({});

  const todayMap = useMemo(() => {
    const map = new Map<string, number>();
    todaySummary.forEach((row) => map.set(row.habitId, row.count));
    return map;
  }, [todaySummary]);

  const items = useMemo(
    () =>
      habits.map((habit) => ({
        habit,
        count: todayMap.get(habit.id) ?? 0,
        target:
          typeof habit.targetPerDay === "number" && habit.targetPerDay > 0 ? habit.targetPerDay : 1,
      })),
    [habits, todayMap]
  );

  const handleMarkComplete = useCallback(
    async (habitId: HabitId) => {
      const entry = items.find((item) => item.habit.id === habitId);
      if (!entry || entry.count >= entry.target) return;
      let shouldProceed = true;
      setPending((prev) => {
        if (prev[habitId]) {
          shouldProceed = false;
          return prev;
        }
        return { ...prev, [habitId]: true };
      });
      if (!shouldProceed) return;
      try {
        await toggleToday(habitId);
      } finally {
        setPending((prev) => {
          if (!prev[habitId]) return prev;
          const next = { ...prev };
          delete next[habitId];
          return next;
        });
      }
    },
    [items, toggleToday]
  );

  const handleMarkIncomplete = useCallback(
    async (habitId: HabitId) => {
      const entry = items.find((item) => item.habit.id === habitId);
      if (!entry || entry.count <= 0) return;
      let shouldProceed = true;
      setPending((prev) => {
        if (prev[habitId]) {
          shouldProceed = false;
          return prev;
        }
        return { ...prev, [habitId]: true };
      });
      if (!shouldProceed) return;
      try {
        await decrementToday(habitId);
      } finally {
        setPending((prev) => {
          if (!prev[habitId]) return prev;
          const next = { ...prev };
          delete next[habitId];
          return next;
        });
      }
    },
    [items, decrementToday]
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <TodayHabitSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (habits.length === 0) {
    return <NoHabitsPlaceholder onCreateRequest={onCreateRequest} />;
  }

  return (
    <TodaySwipeList
      items={items}
      onMarkComplete={handleMarkComplete}
      onMarkIncomplete={handleMarkIncomplete}
      pending={pending}
    />
  );
}
