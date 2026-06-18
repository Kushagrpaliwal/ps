"use client";

import { RefreshCw, Search, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import type { MonitorStatus } from "@/lib/types";

interface HeaderProps {
  status: MonitorStatus | null;
  onRefresh: () => void;
  onMenuToggle: () => void;
  refreshing?: boolean;
}

export function Header({ status, onRefresh, onMenuToggle, refreshing }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-white/5 bg-background/60 backdrop-blur-xl px-4 lg:px-6">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 lg:hidden text-muted-foreground hover:text-foreground"
        onClick={onMenuToggle}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="header-search"
          placeholder="Search products, logs..."
          className="pl-9 bg-white/[0.04] border-white/[0.06] text-sm placeholder:text-muted-foreground/60 focus-visible:ring-neon-cyan/30 focus-visible:border-neon-cyan/30"
        />
      </div>

      <div className="flex items-center gap-3 ml-auto">
        {/* Status indicator */}
        <div className="hidden sm:flex items-center gap-2 rounded-full bg-white/[0.04] px-3 py-1.5 border border-white/[0.06]">
          <div
            className={`h-2 w-2 rounded-full status-pulse ${
              status?.websiteOnline
                ? "bg-neon-green text-neon-green"
                : "bg-neon-red text-neon-red"
            }`}
          />
          <span className="text-xs font-medium text-muted-foreground">
            {status?.websiteOnline ? "Monitoring Active" : "Offline"}
          </span>
        </div>

        {/* Refresh button */}
        <Button
          id="refresh-button"
          variant="ghost"
          size="icon"
          onClick={onRefresh}
          className="relative text-muted-foreground hover:text-neon-cyan hover:bg-neon-cyan/5 transition-colors"
          disabled={refreshing}
        >
          <motion.div
            animate={refreshing ? { rotate: 360 } : { rotate: 0 }}
            transition={refreshing ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
          >
            <RefreshCw className="h-4 w-4" />
          </motion.div>
        </Button>

        {/* Avatar */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple text-xs font-bold text-white">
          SX
        </div>
      </div>
    </header>
  );
}
