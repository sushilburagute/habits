import { useState } from "react";
import { Database, Loader2, Sparkles, Trash2 } from "lucide-react";

import { seedExample } from "@/db/seed";
import { resetWorkspace } from "@/db/repo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

type Status = "idle" | "busy" | "done" | "error";

export function WorkspaceMenu() {
  const [status, setStatus] = useState<Status>("idle");

  const setIdleLater = (delay = 2000) => {
    window.setTimeout(() => setStatus("idle"), delay);
  };

  const withStatus = async (runner: () => Promise<void>, delay = 2000) => {
    setStatus("busy");
    try {
      await runner();
      setStatus("done");
      setIdleLater(delay);
    } catch (error) {
      console.error("Workspace action failed", error);
      setStatus("error");
      setIdleLater(4000);
    }
  };

  const handleSeed = () => {
    void withStatus(async () => {
      await seedExample();
    });
  };

  const handleReset = () => {
    const confirm = window.confirm(
      "This will delete all habits and history from this device. Continue?"
    );
    if (!confirm) return;
    void withStatus(async () => {
      await resetWorkspace();
    }, 2500);
  };

  const renderIcon = () => {
    if (status === "busy") return <Loader2 className="h-4 w-4 animate-spin" />;
    if (status === "error") return <Trash2 className="h-4 w-4 text-destructive" />;
    if (status === "done") return <Sparkles className="h-4 w-4 text-emerald-500" />;
    return <Database className="h-4 w-4" />;
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Workspace tools">
            {renderIcon()}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[200px]">
          <DropdownMenuItem className="gap-2" onSelect={(event) => {
            event.preventDefault();
            handleSeed();
          }}>
            <Sparkles className="h-4 w-4 text-indigo-500" />
            Seed demo data
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="gap-2 text-destructive focus:text-destructive"
            onSelect={(event) => {
              event.preventDefault();
              handleReset();
            }}
          >
            <Trash2 className="h-4 w-4" />
            Reset workspace
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <span className="sr-only" aria-live="polite">
        {status === "done" && "Workspace action completed"}
        {status === "error" && "Workspace action failed"}
      </span>
    </>
  );
}
