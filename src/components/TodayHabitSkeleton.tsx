import { Skeleton } from "@/components/ui/skeleton";

export function TodayHabitSkeleton() {
  return (
    <div className="rounded-xl border border-border/60 bg-background/80 p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-5 w-40" />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}
