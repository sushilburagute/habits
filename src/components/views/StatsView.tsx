import type { ComponentType, SVGProps } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { Award, CalendarDays, Flame, Target, TrendingUp } from "lucide-react";

import { useHabits } from "@/hooks/useDB";
import { useStatsSummary } from "@/hooks/useStats";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { NoHabitsPlaceholder } from "@/components/NoHabitsPlaceholder";

type StatsViewProps = {
  onCreateRequest: () => void;
};

const numberFormatter = new Intl.NumberFormat("en-US");

export function StatsView({ onCreateRequest }: StatsViewProps) {
  const habits = useHabits();
  const summary = useStatsSummary(habits);

  if (!habits.length) {
    return (
      <NoHabitsPlaceholder
        onCreateRequest={onCreateRequest}
        description="Track at least one habit to unlock streak analytics, activity trends, and leaderboard insights."
        actionLabel="Create a habit"
      />
    );
  }

  const lastActivityCopy = summary.lastEntryDate
    ? formatDistanceToNow(dateFromISO(summary.lastEntryDate), { addSuffix: true })
    : "No activity yet";

  const metrics = [
    {
      title: "Total habits",
      value: numberFormatter.format(summary.totalHabits),
      description: "Active trackers in your library",
      icon: Target,
    },
    {
      title: "Total completions",
      value: numberFormatter.format(summary.totalCompletions),
      description: "All-time check-ins",
      icon: TrendingUp,
    },
    {
      title: "Last 30 days",
      value: numberFormatter.format(summary.completionsLast30),
      description: "Marks logged recently",
      icon: Flame,
    },
    {
      title: "Active days",
      value: numberFormatter.format(summary.activeDays),
      description: `Last activity ${lastActivityCopy}`,
      icon: CalendarDays,
    },
  ];

  const maxCurrent =
    summary.leaderboard.reduce((max, entry) => Math.max(max, entry.current), 0) || 1;
  const maxLongest =
    summary.leaderboard.reduce((max, entry) => Math.max(max, entry.longest), 0) || 1;

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </section>

      {summary.longestStreak && (
        <Card className="border border-amber-400/40 bg-amber-500/10 text-amber-900 dark:bg-amber-400/10 dark:text-amber-100">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8" />
              <div>
                <CardTitle className="text-xl">Streak champion</CardTitle>
                <CardDescription className="text-sm text-amber-900/80 dark:text-amber-100/80">
                  Longest chain across all habits
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-col gap-1 text-right text-sm sm:text-base">
              <span className="font-semibold">{summary.longestStreak.habit.name}</span>
              <span className="font-mono text-lg sm:text-xl">
                {summary.longestStreak.longest} day{summary.longestStreak.longest === 1 ? "" : "s"}
              </span>
              {summary.longestStreak.lastMarkedOn && (
                <span className="text-xs text-amber-900/80 dark:text-amber-100/70">
                  Last mark on {format(dateFromISO(summary.longestStreak.lastMarkedOn), "PP")}
                </span>
              )}
            </div>
          </CardHeader>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Current streak leaderboard</CardTitle>
          <CardDescription>Top habits ranked by ongoing streak length.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {summary.leaderboard.length === 0 ? (
            <p className="text-sm text-muted-foreground">No streak data yet. Start logging to see insights.</p>
          ) : (
            <ul className="space-y-2">
              {summary.leaderboard.map((entry, index) => (
                <li
                  key={entry.habit.id}
                  className="flex flex-col gap-3 rounded-lg border border-border/70 bg-muted/40 px-4 py-3"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        #{index + 1} {entry.habit.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {entry.lastMarkedOn
                          ? `Last mark ${formatDistanceToNow(dateFromISO(entry.lastMarkedOn), { addSuffix: true })}`
                          : "No marks yet"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Current {entry.current}</Badge>
                      <Badge variant="outline">Longest {entry.longest}</Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-muted-foreground">
                      <span>Current streak</span>
                      <span className="font-medium text-foreground">{entry.current}d</span>
                    </div>
                    <Progress value={Math.min(100, (entry.current / maxCurrent) * 100)} className="h-2.5" />
                    <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-muted-foreground">
                      <span>Longest streak</span>
                      <span className="font-medium text-foreground">{entry.longest}d</span>
                    </div>
                    <Progress
                      value={Math.min(100, (entry.longest / maxLongest) * 100)}
                      className="h-2.5 bg-muted/60"
                      indicatorClassName="bg-emerald-500"
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

type MetricCardProps = {
  title: string;
  value: string;
  description: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

function MetricCard({ title, value, description, icon: Icon }: MetricCardProps) {
  return (
    <Card className="border border-border/60 bg-background/70 backdrop-blur">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tracking-tight">{value}</div>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function dateFromISO(iso: string) {
  return new Date(`${iso}T00:00:00`);
}
