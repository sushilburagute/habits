import { useMemo } from "react";

import { useHabits, useTodaySummary } from "@/hooks/useDB";
import { HabitCard } from "@/components/HabitCard";
import { NoHabitsPlaceholder } from "@/components/NoHabitsPlaceholder";

type TodayViewProps = {
  onCreateRequest: () => void;
};

export function TodayView({ onCreateRequest }: TodayViewProps) {
  const habits = useHabits();
  const todaySummary = useTodaySummary();

  const todayMap = useMemo(() => {
    const map = new Map<string, number>();
    todaySummary.forEach((row) => map.set(row.habitId, row.count));
    return map;
  }, [todaySummary]);

  if (habits.length === 0) {
    return <NoHabitsPlaceholder onCreateRequest={onCreateRequest} />;
  }

  return (
    <div className="space-y-6">
      {habits.map((habit) => (
        <HabitCard
          key={habit.id}
          habit={habit}
          heatmapDays={28}
          todayCount={todayMap.get(habit.id) ?? 0}
          showToggle
        />
      ))}
    </div>
  );
}
