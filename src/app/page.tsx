"use client";

import { StatsGrid } from "@/components/dashboard/stats-grid";
import { useJsonData } from "@/hooks/use-json-data";
import type { MonitorStatus, Product, LogEntry } from "@/lib/types";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";

export default function DashboardPage() {
  const { data: status } = useJsonData<MonitorStatus>("/status.json");
  const { data: products } = useJsonData<Product[]>("/products.json");
  const { data: logs } = useJsonData<LogEntry[]>("/logs.json");

  const recentLogs = logs?.slice(-5) ?? [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time PS5 stock monitoring on GameLoot.in
        </p>
      </div>

      {/* Stats grid */}
      <StatsGrid status={status} products={products} />

      {/* Recent activity */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35 }}
        className="glass-card rounded-xl p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-4 w-4 text-neon-cyan" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Recent Activity
          </h2>
        </div>
        <div className="space-y-2">
          {recentLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No recent activity
            </p>
          ) : (
            recentLogs.map((log, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-lg bg-white/[0.02] px-3 py-2.5"
              >
                <div
                  className={`mt-1 h-1.5 w-1.5 rounded-full shrink-0 ${
                    log.level === "success"
                      ? "bg-neon-green"
                      : log.level === "warn"
                      ? "bg-neon-yellow"
                      : log.level === "error"
                      ? "bg-neon-red"
                      : "bg-neon-cyan"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground/90 truncate">
                    {log.message}
                  </p>
                </div>
                <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString("en-IN", {
                    hour12: false,
                    timeZone: "Asia/Kolkata",
                  })}
                </span>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
