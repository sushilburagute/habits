import { useMemo } from "react";
import { format, isAfter, isSameDay } from "date-fns";

import type { Habit } from "@/db/database.type";
import { useRangeMap } from "@/hooks/useDB";
import { HABIT_COLOR_CONFIG } from "@/constants/colors";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type HabitHeatmapProps = {
  habit: Habit;
  days: number;
  className?: string;
  caption?: string;
  startDate?: Date;
  endDate?: Date;
};

type HeatmapCell = {
  date: Date;
  iso: string;
  value: number;
  level: number;
  isToday: boolean;
  isFuture: boolean;
};

const LEVEL_ALPHAS = [0, 0.24, 0.5, 0.7, 0.9];

export function HabitHeatmap({ habit, days, className, caption, startDate: overrideStart, endDate: overrideEnd }: HabitHeatmapProps) {
  const endDate = useMemo(() => {
    if (overrideEnd) {
      const clone = new Date(overrideEnd);
      clone.setHours(23, 59, 59, 999);
      return clone;
    }
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    return now;
  }, [overrideEnd]);

  const startDate = useMemo(() => {
    if (overrideStart) {
      const clone = new Date(overrideStart);
      clone.setHours(0, 0, 0, 0);
      return clone;
    }
    const d = new Date(endDate);
    d.setDate(d.getDate() - (days - 1));
    d.setHours(0, 0, 0, 0);
    return d;
  }, [overrideStart, days, endDate]);

  const startOfGrid = useMemo(() => alignToWeekStart(startDate), [startDate]);
  const endOfGrid = useMemo(() => alignToWeekEnd(endDate), [endDate]);

  const heatmapData = useRangeMap(habit.id, startOfGrid, endOfGrid);

  const weeks = useMemo(
    () => buildWeeks(habit, startOfGrid, endOfGrid, heatmapData),
    [habit, startOfGrid, endOfGrid, heatmapData]
  );

  const months = useMemo(() => extractMonthLabels(startDate, weeks), [startDate, weeks]);

  const palette = HABIT_COLOR_CONFIG[habit.color];

  return (
    <div className={cn("space-y-2", className)}>
      {caption && <p className="text-sm font-medium text-muted-foreground">{caption}</p>}
      <TooltipProvider>
        <div className="flex gap-3 overflow-x-auto pb-1">
          <div className="flex flex-col justify-between py-2 text-xs text-muted-foreground">
            <span>Mon</span>
            <span>Wed</span>
            <span>Fri</span>
          </div>
          <div className="min-w-max">
            <div className="mb-1 flex gap-1 text-[10px] uppercase tracking-widest text-muted-foreground">
              {months.map((month) => (
                <span className="w-8 text-left" key={month.key}>
                  {month.label}
                </span>
              ))}
            </div>
            <div className="flex gap-1">
              {weeks.map((week, columnIndex) => (
                <div className="flex flex-col gap-1" key={`${week[0]?.iso ?? `week-${columnIndex}`}-${columnIndex}`}>
                  {week.map((cell) => {
                    const background = getCellBackground(palette.hex, cell.level);
                    return (
                      <Tooltip key={cell.iso} delayDuration={50}>
                        <TooltipTrigger asChild>
                          <div
                            aria-hidden="true"
                            className={cn(
                              "size-3 rounded-[4px] border border-transparent transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                              cell.isFuture && "border-dashed border-border/60 bg-transparent"
                            )}
                            style={{
                              backgroundColor: cell.isFuture ? "transparent" : background,
                              boxShadow: cell.isToday ? `0 0 0 1px ${palette.hex}` : undefined,
                            }}
                            tabIndex={cell.isFuture ? -1 : 0}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs font-medium">{format(cell.date, "PPPP")}</p>
                          <p className="text-xs text-muted-foreground">
                            {cell.value > 0 ? `${cell.value} logged` : "No activity"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </TooltipProvider>
      <HeatmapLegend hex={palette.hex} target={habit.targetPerDay ?? 1} />
    </div>
  );
}

function getCellBackground(hex: string, level: number): string {
  if (level <= 0) return "transparent";
  const [r, g, b] = hexToRgb(hex);
  const alpha = LEVEL_ALPHAS[level];
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const bigint = Number.parseInt(clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
}

function alignToWeekStart(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - ((day + 6) % 7)); // Monday as start
  d.setHours(0, 0, 0, 0);
  return d;
}

function alignToWeekEnd(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() + (6 - ((day + 6) % 7)));
  d.setHours(23, 59, 59, 999);
  return d;
}

function buildWeeks(
  habit: Habit,
  startDate: Date,
  endDate: Date,
  map: Record<string, number>
): HeatmapCell[][] {
  const cells: HeatmapCell[] = [];
  const cursor = new Date(startDate);
  const today = new Date();
  const target = habit.targetPerDay && habit.targetPerDay > 0 ? habit.targetPerDay : 1;

  while (!isAfter(cursor, endDate)) {
    const iso = cursor.toISOString().slice(0, 10);
    const value = map[iso] ?? 0;
    const level = computeLevel(value, target);
    const isToday = isSameDay(cursor, today);
    const isFuture = cursor > today;

    cells.push({
      date: new Date(cursor),
      iso,
      value,
      level,
      isFuture,
      isToday,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  const weeks: HeatmapCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

function computeLevel(value: number, target: number) {
  if (value <= 0) return 0;
  const ratio = value / target;
  if (ratio >= 1.75) return 4;
  if (ratio >= 1.25) return 3;
  if (ratio >= 0.75) return 2;
  return 1;
}

function extractMonthLabels(startDate: Date, weeks: HeatmapCell[][]) {
  const labels: Array<{ key: string; label: string }> = [];
  let lastLabel: string | null = null;
  const startMonth = startDate.getMonth();
  const startYear = startDate.getFullYear();

  weeks.forEach((week, index) => {
    const firstCell = week[0];
    if (!firstCell) {
      labels.push({ key: `week-${index}`, label: "" });
      return;
    }

    const anchor =
      week.find((cell) => cell.date.getDate() === 1) ??
      (index === 0
        ? week.find((cell) => cell.date.getMonth() === startMonth && cell.date.getFullYear() === startYear) ?? firstCell
        : undefined);

    if (!anchor) {
      labels.push({ key: `${firstCell.iso}-blank`, label: "" });
      return;
    }

    const monthLabel = format(anchor.date, "MMM");
    if (monthLabel === lastLabel) {
      labels.push({ key: `${firstCell.iso}-blank`, label: "" });
      return;
    }

    lastLabel = monthLabel;
    labels.push({ key: anchor.iso, label: monthLabel });
  });

  return labels;
}

function HeatmapLegend({ hex, target }: { hex: string; target: number }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      <span>Less</span>
      <div className="flex items-center gap-1">
        {[0, 1, 2, 3, 4].map((level) => (
          <span
            key={level}
            className="size-4 rounded-sm border border-border/60"
            style={{ backgroundColor: getCellBackground(hex, level) }}
          />
        ))}
      </div>
      <span>More</span>
      <span className="ml-auto sm:ml-4">
        Target {target}
        /day
      </span>
    </div>
  );
}
