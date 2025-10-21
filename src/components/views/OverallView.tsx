import { useHabits } from "@/hooks/useDB";
import { HabitCard } from "@/components/HabitCard";
import { NoHabitsPlaceholder } from "@/components/NoHabitsPlaceholder";

type OverallViewProps = {
  onCreateRequest: () => void;
};

export function OverallView({ onCreateRequest }: OverallViewProps) {
  const habits = useHabits();
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 1);

  if (habits.length === 0) {
    return (
      <NoHabitsPlaceholder
        onCreateRequest={onCreateRequest}
        description="Your yearly streak archive will unlock once you track at least one habit."
        actionLabel="Start tracking"
      />
    );
  }

  return (
    <div className="space-y-6">
      {habits.map((habit) => (
        <HabitCard
          key={habit.id}
          habit={habit}
          heatmapDays={365}
          showToggle={false}
          showTodaySummary={false}
          heatmapStartDate={startOfYear}
          heatmapEndDate={today}
        />
      ))}
    </div>
  );
}
