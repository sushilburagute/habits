import { CalendarCheck2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type NoHabitsPlaceholderProps = {
  onCreateRequest: () => void;
  description?: string;
  actionLabel?: string;
};

export function NoHabitsPlaceholder({
  onCreateRequest,
  description = "Habits stay local on your device. Add one to start logging your streak.",
  actionLabel = "Create a habit",
}: NoHabitsPlaceholderProps) {
  return (
    <Card className="border-dashed border-muted-foreground/40 bg-background/40 text-center">
      <CardHeader>
        <CardTitle className="flex flex-col items-center gap-4 text-2xl font-semibold text-foreground">
          <CalendarCheck2 className="h-10 w-10 text-muted-foreground" />
          Build your first habit
        </CardTitle>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={onCreateRequest} size="lg">
          {actionLabel}
        </Button>
      </CardContent>
    </Card>
  );
}
