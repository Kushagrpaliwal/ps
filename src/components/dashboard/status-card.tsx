"use client";

import { motion } from "framer-motion";
import { Wifi, WifiOff } from "lucide-react";

interface StatusCardProps {
  online: boolean;
}

export function StatusCard({ online }: StatusCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 }}
      className={`glass-card rounded-xl p-5 ${online ? "glow-green" : "glow-red"}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Website Status
        </span>
        {online ? (
          <Wifi className="h-4 w-4 text-neon-green" />
        ) : (
          <WifiOff className="h-4 w-4 text-neon-red" />
        )}
      </div>
      <div className="flex items-center gap-3">
        <div
          className={`h-3 w-3 rounded-full status-pulse ${
            online ? "bg-neon-green text-neon-green" : "bg-neon-red text-neon-red"
          }`}
        />
        <span
          className={`text-2xl font-bold ${
            online ? "text-neon-green" : "text-neon-red"
          }`}
        >
          {online ? "ONLINE" : "OFFLINE"}
        </span>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {online ? "All systems operational" : "Connection lost"}
      </p>
    </motion.div>
  );
}
