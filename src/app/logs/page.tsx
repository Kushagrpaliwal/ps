"use client";

import { useJsonData } from "@/hooks/use-json-data";
import { TerminalLog } from "@/components/logs/terminal-log";
import type { LogEntry } from "@/lib/types";
import { Terminal } from "lucide-react";

export default function LogsPage() {
  const { data: logs, loading } = useJsonData<LogEntry[]>("/logs.json");

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Terminal className="h-6 w-6 text-neon-cyan" />
          System Logs
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time monitoring activity log — last 100 entries
        </p>
      </div>

      {loading ? (
        <div className="terminal-bg h-96 animate-pulse rounded-xl" />
      ) : (
        <TerminalLog logs={logs ?? []} />
      )}
    </div>
  );
}
