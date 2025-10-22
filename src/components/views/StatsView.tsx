import type { ComponentType, SVGProps } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { Award, CalendarDays, Flame, Target, TrendingUp } from "lucide-react";

import { useHabits } from "@/hooks/useDB";
import { type StatsSummary, useStatsSummary } from "@/hooks/useStats";
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

      <InsightTimelineCard timeline={summary.timeline} />

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

type InsightTimelineCardProps = {
  timeline: StatsSummary["timeline"];
};

function InsightTimelineCard({ timeline }: InsightTimelineCardProps) {
  const recentWeeks = timeline.weeks.slice(-4).reverse();
  const recentMonths = timeline.months.slice(-4).reverse();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Insight timeline</CardTitle>
        <CardDescription>
          Week-over-week and month-over-month momentum plus streak alerts for habits that need attention.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <TrendList title="Week over week" points={recentWeeks} kind="week" />
          <TrendList title="Month over month" points={recentMonths} kind="month" />
        </div>
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Streak watch</h4>
          {timeline.atRisk.length === 0 ? (
            <p className="text-sm text-muted-foreground">All habits are caught up for today. Keep the momentum going!</p>
          ) : (
            <ul className="space-y-2">
              {timeline.atRisk.map((entry) => (
                <li key={entry.habit.id} className="rounded-lg border border-border/60 bg-muted/40 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground">{entry.habit.name}</p>
                    <Badge variant="secondary">{entry.streakLength} day streak</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {entry.lastMarkedOn
                      ? `Last mark ${formatDistanceToNow(dateFromISO(entry.lastMarkedOn), { addSuffix: true })}.`
                      : "Track this habit today to build a streak."}{" "}
                    Log today to keep it alive.
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

type TrendListProps = {
  title: string;
  points: Array<StatsSummary["timeline"]["weeks"][number]>;
  kind: "week" | "month";
};

function TrendList({ title, points, kind }: TrendListProps) {
  if (points.length === 0) {
    return (
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h4>
        <p className="mt-2 text-sm text-muted-foreground">No activity logged yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h4>
      <ul className="space-y-2">
        {points.map((point) => {
          const label =
            kind === "week" ? formatWeekRange(point.start, point.end) : formatMonthLabel(point.start);
          const deltaCopy = formatDelta(point.delta);
          const deltaClass = getDeltaClass(point.delta);

          return (
            <li key={point.period} className="rounded-lg border border-border/60 bg-muted/40 px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground">{deltaCopy}</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-semibold text-foreground">
                    {numberFormatter.format(point.total)}
                  </span>
                  <span className={`block text-xs ${deltaClass}`}>{formatDeltaSimple(point.delta)}</span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function formatWeekRange(startISO: string, endISO: string) {
  const start = dateFromISO(startISO);
  const end = dateFromISO(endISO);
  const sameMonth = start.getMonth() === end.getMonth();
  const startLabel = format(start, "MMM d");
  const endLabel = sameMonth ? format(end, "d") : format(end, "MMM d");
  return `${startLabel} - ${endLabel}`;
}

function formatMonthLabel(startISO: string) {
  const start = dateFromISO(startISO);
  return format(start, "MMMM yyyy");
}

function formatDelta(delta: number | null) {
  if (delta === null) return "Baseline period";
  if (delta > 0) return `Up ${numberFormatter.format(delta)} vs prior`;
  if (delta < 0) return `Down ${numberFormatter.format(Math.abs(delta))} vs prior`;
  return "No change vs prior period";
}

function formatDeltaSimple(delta: number | null) {
  if (delta === null) return "-";
  if (delta > 0) return `+${numberFormatter.format(delta)}`;
  if (delta < 0) return `-${numberFormatter.format(Math.abs(delta))}`;
  return "0";
}

function getDeltaClass(delta: number | null) {
  if (delta === null) return "text-muted-foreground";
  if (delta > 0) return "text-emerald-500";
  if (delta < 0) return "text-rose-500";
  return "text-muted-foreground";
}
