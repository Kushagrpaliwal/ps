"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import type { LogEntry } from "@/lib/types";

interface TerminalLogProps {
  logs: LogEntry[];
}

const levelColors: Record<LogEntry["level"], string> = {
  info: "text-neon-cyan",
  success: "text-neon-green",
  warn: "text-neon-yellow",
  error: "text-neon-red",
};

export function TerminalLog({ logs }: TerminalLogProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="terminal-bg overflow-hidden"
    >
      {/* Terminal header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <div className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <div className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>
        <span className="text-xs text-muted-foreground ml-2 font-mono">
          sentinelx-monitor — bash
        </span>
      </div>

      {/* Log entries */}
      <div
        ref={containerRef}
        className="p-4 max-h-[600px] overflow-y-auto font-mono text-[13px] leading-relaxed space-y-1"
      >
        {logs.length === 0 ? (
          <p className="text-muted-foreground">Waiting for log entries...</p>
        ) : (
          logs.map((log, i) => {
            const time = new Date(log.timestamp).toLocaleTimeString("en-IN", {
              hour12: false,
              timeZone: "Asia/Kolkata",
            });
            return (
              <div key={i} className="flex gap-2 hover:bg-white/[0.02] rounded px-1 -mx-1 transition-colors">
                <span className="text-muted-foreground/50 shrink-0 select-none">
                  [{time}]
                </span>
                <span className={levelColors[log.level]}>
                  {log.message}
                </span>
              </div>
            );
          })
        )}
        <div className="flex items-center gap-1 text-neon-green pt-1">
          <span>$</span>
          <span className="w-2 h-4 bg-neon-green/70 animate-pulse" />
        </div>
      </div>
    </motion.div>
  );
}
