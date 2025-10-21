import { useState } from "react";

import type { HabitColor } from "@/db/database.type";
import { createHabit } from "@/db/repo";
import { HABIT_COLOR_CHOICES } from "@/constants/colors";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type CreateHabitDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateHabitDialog({ open, onOpenChange }: CreateHabitDialogProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState<HabitColor>("blue");
  const [targetPerDay, setTargetPerDay] = useState<number | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = () => {
    setName("");
    setColor("blue");
    setTargetPerDay("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await createHabit({
        name,
        color,
        targetPerDay:
          typeof targetPerDay === "number" && !Number.isNaN(targetPerDay)
            ? targetPerDay
            : undefined,
      });
      reset();
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) reset();
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a habit</DialogTitle>
          <DialogDescription>Pick a color and name to start tracking streaks.</DialogDescription>
        </DialogHeader>
        <form className="space-y-6 pt-2" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="habit-name">Name</Label>
            <Input
              id="habit-name"
              autoFocus
              placeholder="Read 20 pages"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div className="space-y-3">
            <Label>Color</Label>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {HABIT_COLOR_CHOICES.map((option) => {
                const isActive = option.value === color;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setColor(option.value)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border border-transparent bg-muted/40 px-3 py-2 text-left transition hover:border-border/80 hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      isActive && "border-border bg-background shadow-sm"
                    )}
                  >
                    <span
                      className="inline-flex h-5 w-5 rounded-full ring-1 ring-white/80"
                      style={{ backgroundColor: option.hex }}
                    />
                    <span className="text-sm font-medium text-foreground">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="habit-target">
              Target per day <span className="text-xs text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="habit-target"
              type="number"
              min={1}
              step={1}
              placeholder="1"
              value={targetPerDay}
              onChange={(event) => {
                const next = event.target.value;
                setTargetPerDay(next === "" ? "" : Number.parseInt(next, 10));
              }}
            />
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || isSubmitting}>
              {isSubmitting ? "Saving…" : "Create habit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
