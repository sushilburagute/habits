import { useCallback, useMemo, type KeyboardEvent } from "react";
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import { Check, ChevronRight, Loader2, Undo2 } from "lucide-react";

import type { Habit, HabitId } from "@/db/database.type";
import { HABIT_COLOR_CONFIG } from "@/constants/colors";
import { cn } from "@/lib/utils";

type TodaySwipeListProps = {
  items: Array<{
    habit: Habit;
    count: number;
    target: number;
  }>;
  onMarkComplete: (habitId: HabitId) => void;
  onMarkIncomplete: (habitId: HabitId) => void;
  pending: Record<HabitId, boolean | undefined>;
  threshold?: number;
};

const DEFAULT_THRESHOLD = 120;

export function TodaySwipeList({
  items,
  onMarkComplete,
  onMarkIncomplete,
  pending,
  threshold = DEFAULT_THRESHOLD,
}: TodaySwipeListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 80, tolerance: 8 } })
  );

  const itemMap = useMemo(() => {
    const map = new Map<HabitId, TodaySwipeListProps["items"][number]>();
    for (const item of items) {
      map.set(item.habit.id, item);
    }
    return map;
  }, [items]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, delta } = event;
      if (!active) return;
      const deltaX = Math.max(0, delta.x);
      const habitId = active.id as HabitId;
      const item = itemMap.get(habitId);
      if (!item) return;
      if (pending[habitId]) return;
      if (deltaX >= threshold && item.count < item.target) {
        onMarkComplete(habitId);
        return;
      }
      if (delta.x <= -threshold && item.count > 0) {
        onMarkIncomplete(habitId);
      }
    },
    [itemMap, onMarkComplete, onMarkIncomplete, pending, threshold]
  );

  return (
    <DndContext
      sensors={sensors}
      modifiers={[restrictToHorizontalAxis]}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-3">
        {items.map((item) => (
          <SwipeHabitRow
            key={item.habit.id}
            habit={item.habit}
            count={item.count}
            target={item.target}
            threshold={threshold}
            isPending={Boolean(pending[item.habit.id])}
            onMarkComplete={() => onMarkComplete(item.habit.id)}
            onMarkIncomplete={() => onMarkIncomplete(item.habit.id)}
          />
        ))}
      </div>
    </DndContext>
  );
}

type SwipeHabitRowProps = {
  habit: Habit;
  count: number;
  target: number;
  threshold: number;
  isPending: boolean;
  onMarkComplete: () => void;
  onMarkIncomplete: () => void;
};

function SwipeHabitRow({
  habit,
  count,
  target,
  threshold,
  isPending,
  onMarkComplete,
  onMarkIncomplete,
}: SwipeHabitRowProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: habit.id,
    disabled: isPending,
  });

  const rawTranslateX = transform?.x ?? 0;
  const palette = HABIT_COLOR_CONFIG[habit.color];
  const isComplete = count >= target;
  const canUndo = count > 0;
  const maxRight = isComplete ? 0 : threshold;
  const maxLeft = canUndo ? -threshold : 0;
  const clampedX = Math.max(maxLeft, Math.min(rawTranslateX, maxRight));
  const rightProgress = maxRight === 0 ? 0 : Math.max(0, clampedX) / threshold;
  const leftProgress = maxLeft === 0 ? 0 : Math.max(0, -clampedX) / threshold;

  const backgroundWidth = isComplete ? "100%" : `${Math.min(rightProgress * 100, 100)}%`;
  const undoWidth = `${Math.min(leftProgress * 100, 100)}%`;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (!isPending) onMarkComplete();
      } else if (event.key === "Backspace" || event.key === "Delete") {
        event.preventDefault();
        if (!isPending && canUndo) onMarkIncomplete();
      }
    },
    [canUndo, isPending, onMarkComplete, onMarkIncomplete]
  );

  return (
    <div className="relative select-none">
      <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
        <div
          className="absolute inset-y-0 left-0 rounded-xl transition-all duration-150 ease-out"
          style={{
            width: backgroundWidth,
            backgroundColor: palette.hex,
            opacity: isComplete ? 0.45 : 0.18 + rightProgress * 0.4,
          }}
        />
        <div
          className="absolute inset-y-0 right-0 rounded-xl transition-all duration-150 ease-out"
          style={{
            width: undoWidth,
            backgroundColor: palette.hex,
            opacity: canUndo ? 0.18 + leftProgress * 0.4 : 0,
          }}
        />
      </div>
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        role="button"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        aria-pressed={isComplete}
        className={cn(
          "relative flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-background px-4 py-4 shadow-sm transition-colors",
          isComplete && "border-transparent bg-background/80"
        )}
        style={{
          transform: CSS.Translate.toString({
            x: clampedX,
            y: 0,
            scaleX: 1,
            scaleY: 1,
          }),
          transition: isDragging ? undefined : "transform 180ms ease",
          touchAction: "pan-y",
        }}
      >
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="inline-flex h-3 w-3 rounded-full ring-1 ring-foreground/30"
            style={{ backgroundColor: palette.hex }}
          />
          <div>
            <p className="text-sm font-semibold text-foreground">{habit.name}</p>
            <p className="text-xs text-muted-foreground">
              Today {count} / {target}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <SwipeIndicator
            rightProgress={rightProgress}
            leftProgress={leftProgress}
            isComplete={isComplete}
            isPending={isPending}
            color={palette.hex}
            canUndo={canUndo}
          />
        </div>
      </div>
    </div>
  );
}

function SwipeIndicator({
  rightProgress,
  leftProgress,
  isComplete,
  isPending,
  color,
  canUndo,
}: {
  rightProgress: number;
  leftProgress: number;
  isComplete: boolean;
  isPending: boolean;
  color: string;
  canUndo: boolean;
}) {
  if (isPending) {
    return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
  }
  if (leftProgress > 0 && canUndo) {
    return (
      <div className="flex items-center gap-1 text-xs font-medium" style={{ color }}>
        <Undo2 className="h-4 w-4" />
        <span>Undo</span>
      </div>
    );
  }
  if (isComplete) {
    return (
      <div className="flex items-center gap-1 text-xs font-semibold" style={{ color }}>
        <Check className="h-5 w-5" />
        <span>Done</span>
      </div>
    );
  }
  if (rightProgress > 0) {
    return (
      <div className="flex items-center gap-1 text-xs font-medium" style={{ color }}>
        <ChevronRight className="h-4 w-4" />
        <span>Swipe</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <ChevronRight className="h-4 w-4" style={{ color }} />
      <span className="font-medium" style={{ color }}>
        Swipe
      </span>
    </div>
  );
}
