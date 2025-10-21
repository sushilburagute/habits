import { useHabits } from "@/hooks/useDB";
import { HabitCard } from "@/components/HabitCard";
import { NoHabitsPlaceholder } from "@/components/NoHabitsPlaceholder";

type WeekViewProps = {
  onCreateRequest: () => void;
};

export function WeekView({ onCreateRequest }: WeekViewProps) {
  const habits = useHabits();

  if (habits.length === 0) {
    return (
      <NoHabitsPlaceholder
        onCreateRequest={onCreateRequest}
        description="Plot a few habits to unlock the weekly heatmap and cadence insights."
        actionLabel="Add your first habit"
      />
    );
  }

  return (
    <div className="space-y-6">
      {habits.map((habit) => (
        <HabitCard key={habit.id} habit={habit} heatmapDays={84} showToggle={false} showTodaySummary={false} />
      ))}
    </div>
  );
}
