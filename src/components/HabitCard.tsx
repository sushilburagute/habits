import { useEffect, useMemo, useState } from "react";
import { Flame, PartyPopper, RefreshCcw } from "lucide-react";

import type { Habit } from "@/db/database.type";
import { toggleToday } from "@/db/repo";
import { useStreaks } from "@/hooks/useDB";
import { HABIT_COLOR_CONFIG } from "@/constants/colors";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HabitHeatmap } from "@/components/HabitHeatmap";
import { cn } from "@/lib/utils";

type HabitCardProps = {
  habit: Habit;
  heatmapDays: number;
  todayCount?: number;
  showToggle?: boolean;
  showTodaySummary?: boolean;
  heatmapStartDate?: Date;
  heatmapEndDate?: Date;
};

export function HabitCard({
  habit,
  heatmapDays,
  todayCount = 0,
  showToggle = false,
  showTodaySummary = true,
  heatmapStartDate,
  heatmapEndDate,
}: HabitCardProps) {
  const { current, longest } = useStreaks(habit.id);
  const [localCount, setLocalCount] = useState(todayCount);
  const [isToggling, setIsToggling] = useState(false);
  const [celebrating, setCelebrating] = useState(false);

  useEffect(() => {
    setLocalCount(todayCount);
  }, [todayCount]);

  useEffect(() => {
    if (!celebrating) return;
    const timeout = window.setTimeout(() => setCelebrating(false), 1800);
    return () => window.clearTimeout(timeout);
  }, [celebrating]);

  const palette = HABIT_COLOR_CONFIG[habit.color];
  const target = useMemo(
    () => (typeof habit.targetPerDay === "number" && habit.targetPerDay > 0 ? habit.targetPerDay : 1),
    [habit.targetPerDay]
  );
  useEffect(() => {
    if (todayCount < target) {
      setCelebrating(false);
    }
  }, [todayCount, target]);

  const streakCopy = useMemo(() => {
    if (current === 0) return "No streak yet";
    if (current === 1) return "1 day streak";
    return `${current} day streak`;
  }, [current]);

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      const next = await toggleToday(habit.id);
      setLocalCount(next);
      setCelebrating(target > 0 && next >= target);
    } finally {
      setIsToggling(false);
    }
  };

  const targetDisplay = `${Number.isInteger(target) ? target : target.toString()}/day target`;
  const hasProgress = localCount > 0;
  const isComplete = localCount >= target;

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-3 text-xl font-semibold">
            <span
              aria-hidden="true"
              className="inline-flex h-4 w-4 rounded-full ring-1 ring-foreground/20"
              style={{ backgroundColor: palette.hex }}
            />
            {habit.name}
          </CardTitle>
          <CardDescription className="flex flex-wrap items-center gap-3 text-sm">
            <span className="flex items-center gap-1 text-foreground">
              <Flame className="h-4 w-4 text-orange-500" />
              {streakCopy}
            </span>
            <span className="text-muted-foreground">
              Longest streak {longest} {longest === 1 ? "day" : "days"}
            </span>
            <span className="hidden text-muted-foreground sm:inline">{targetDisplay}</span>
          </CardDescription>
        </div>
        {showToggle && (
          <Button onClick={handleToggle} disabled={isToggling} variant={isComplete ? "outline" : "default"}>
            {isToggling ? (
              <>
                <RefreshCcw className="h-4 w-4 animate-spin" />
                updating…
              </>
            ) : isComplete ? (
              <>
                <PartyPopper className="h-4 w-4 text-emerald-400" />
                target met
              </>
            ) : hasProgress ? (
              <>
                <PartyPopper className="h-4 w-4" />
                log progress
              </>
            ) : (
              <>
                <PartyPopper className="h-4 w-4" />
                mark today
              </>
            )}
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {showTodaySummary && (
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-wide text-muted-foreground">
            <span>
              Today:{" "}
              <span className="font-semibold text-foreground">
                {localCount} / {target}
              </span>
            </span>
            <span className="sm:hidden">{targetDisplay}</span>
            {celebrating && (
              <Badge variant="secondary" className={cn("animate-bounce bg-emerald-500/20 text-emerald-500")}>
                <PartyPopper className="mr-1 h-3 w-3" />
                keep the streak alive!
              </Badge>
            )}
          </div>
        )}
        <HabitHeatmap habit={habit} days={heatmapDays} startDate={heatmapStartDate} endDate={heatmapEndDate} />
      </CardContent>
    </Card>
  );
}
