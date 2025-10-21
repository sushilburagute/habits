import { useRef, useState } from "react";
import { Download, Loader2, Upload } from "lucide-react";

import { downloadBackup, importBackupFile } from "@/utils/backup";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function BackupMenu() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "importing" | "done" | "error">("idle");

  const handleImport = async (file: File) => {
    setStatus("importing");
    try {
      await importBackupFile(file);
      setStatus("done");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (error) {
      console.error("Failed to import backup", error);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 4000);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleImport(file);
        }}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Backup and restore">
            {status === "importing" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[180px]">
          <DropdownMenuItem
            className="gap-2"
            onSelect={(event) => {
              event.preventDefault();
              void downloadBackup();
              setStatus("done");
              setTimeout(() => setStatus("idle"), 2000);
            }}
          >
            <Download className="h-4 w-4" />
            Export backup
          </DropdownMenuItem>
          <DropdownMenuItem
            className="gap-2"
            onSelect={(event) => {
              event.preventDefault();
              fileInputRef.current?.click();
            }}
          >
            <Upload className="h-4 w-4" />
            Import backup
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <span className="sr-only" aria-live="polite">
        {status === "done" && "Backup action completed"}
        {status === "error" && "Backup import failed"}
      </span>
    </>
  );
}
