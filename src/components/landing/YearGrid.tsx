import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";

import { HABIT_COLOR_CONFIG } from "@/constants/colors";
import { HERO_HABITS } from "@/constants/landing";
import { getCellBackground } from "@/lib/heatmap";
import { cn } from "@/lib/utils";

const WEEKS = 53;
const DAYS_PER_WEEK = 7;

const HERO_HEX = HERO_HABITS.map((habit) => HABIT_COLOR_CONFIG[habit.color].hex);

type Cell = {
  index: number;
  date: Date;
  level: number;
  colorIndex: number;
  isFuture: boolean;
};

type YearGridProps = {
  className?: string;
};

export function YearGrid({ className }: YearGridProps) {
  const { columns, monthLabels } = useMemo(buildYear, []);
  const [painted, setPainted] = useState<Record<number, number>>({});
  const isDrawing = useRef(false);
  const strokeColor = useRef(0);

  useEffect(() => {
    const stop = () => {
      isDrawing.current = false;
    };
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    return () => {
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
  }, []);

  const paint = useCallback((cell: Cell) => {
    if (cell.isFuture) return;
    setPainted((prev) =>
      prev[cell.index] === strokeColor.current
        ? prev
        : { ...prev, [cell.index]: strokeColor.current }
    );
  }, []);

  const startStroke = useCallback(
    (cell: Cell) => {
      isDrawing.current = true;
      strokeColor.current = (strokeColor.current + 1) % HERO_HEX.length;
      paint(cell);
    },
    [paint]
  );

  return (
    <div className={cn("select-none", className)}>
      <div className="flex w-full gap-[clamp(2px,0.34vw,4px)]" aria-hidden="true">
        {columns.map((week, columnIndex) => (
          <div
            key={columnIndex}
            className="flex min-w-0 flex-1 flex-col gap-[clamp(2px,0.34vw,4px)]"
          >
            {week.map((cell) => {
              const paintedColor = painted[cell.index];
              const isPainted = paintedColor !== undefined;
              const hex = HERO_HEX[isPainted ? paintedColor : cell.colorIndex];
              const level = isPainted ? 4 : cell.level;

              return (
                <div
                  key={cell.index}
                  data-painted={isPainted ? "true" : undefined}
                  onPointerDown={() => startStroke(cell)}
                  onPointerEnter={(event) => {
                    if (isDrawing.current && event.pointerType === "mouse") paint(cell);
                  }}
                  className={cn(
                    "lp-cell aspect-square w-full rounded-[2px] border border-transparent sm:rounded-[3px]",
                    cell.isFuture
                      ? "border-dashed border-border/50"
                      : "cursor-crosshair bg-muted/45"
                  )}
                  style={{
                    animationDelay: `${columnIndex * 17 + (cell.index % DAYS_PER_WEEK) * 6}ms`,
                    // Level 0 keeps the muted class fill so the grid itself stays readable.
                    backgroundColor:
                      cell.isFuture || level === 0 ? undefined : getCellBackground(hex, level),
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Below sm the columns are narrower than the labels, so the axis is dropped. */}
      <div className="mt-2 hidden w-full gap-[clamp(2px,0.34vw,4px)] sm:flex" aria-hidden="true">
        {monthLabels.map((label, index) => (
          <span
            key={index}
            className="min-w-0 flex-1 font-mono text-[10px] tracking-widest text-muted-foreground uppercase"
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

function buildYear() {
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  // End the grid on the Sunday of the current week, the way the app's heatmaps do.
  const end = new Date(today);
  end.setDate(end.getDate() + (6 - ((end.getDay() + 6) % 7)));
  const start = new Date(end);
  start.setDate(start.getDate() - (WEEKS * DAYS_PER_WEEK - 1));
  start.setHours(0, 0, 0, 0);

  const random = makeRandom(20260802);
  const columns: Array<Array<Cell>> = [];
  const monthLabels: Array<string> = [];
  let lastMonth = "";
  let colorIndex = 0;

  for (let column = 0; column < WEEKS; column++) {
    const week: Array<Cell> = [];
    for (let row = 0; row < DAYS_PER_WEEK; row++) {
      const index = column * DAYS_PER_WEEK + row;
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const isFuture = date > today;

      // Hold a colour for a stretch of days so the year reads as habits taking
      // turns, rather than as confetti.
      if (random() > 0.93) colorIndex = Math.floor(random() * HERO_HEX.length);

      week.push({
        index,
        date,
        isFuture,
        colorIndex,
        level: isFuture ? 0 : pickLevel(column, row, random),
      });
    }
    columns.push(week);

    // Label a column only where a new month begins, so the axis reads as a timeline.
    const monthStart = week.find((cell) => cell.date.getDate() <= DAYS_PER_WEEK);
    const label = monthStart ? format(monthStart.date, "MMM") : "";
    monthLabels.push(label && label !== lastMonth ? label : "");
    if (label) lastMonth = label;
  }

  return { columns, monthLabels };
}

/**
 * A year that reads like a real one: thin at the start, denser as the habit
 * sticks, with two gaps where life got in the way.
 */
function pickLevel(column: number, row: number, random: () => number) {
  const onHoliday = (column >= 14 && column <= 16) || (column >= 33 && column <= 34);
  if (onHoliday) return random() > 0.82 ? 1 : 0;

  const isWeekend = row >= 5;
  const momentum = 0.58 + 0.38 * (column / (WEEKS - 1));
  const chance = isWeekend ? momentum * 0.72 : momentum;
  if (random() > chance) return 0;

  // Intensity climbs with momentum too, so later months read darker as well as fuller.
  const intensity = random() * (0.7 + 0.5 * (column / (WEEKS - 1)));
  if (intensity > 0.78) return 4;
  if (intensity > 0.52) return 3;
  if (intensity > 0.24) return 2;
  return 1;
}

function makeRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}
