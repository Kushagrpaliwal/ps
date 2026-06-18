"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, X } from "lucide-react";
import { navItems } from "@/config/nav";
import { cn } from "@/lib/utils";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        className={cn(
          "glass-sidebar fixed inset-y-0 left-0 z-50 flex w-64 flex-col lg:relative lg:z-0",
          !open && "max-lg:-translate-x-full"
        )}
        initial={false}
        animate={{ x: open ? 0 : undefined }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3 group" onClick={onClose}>
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 border border-neon-cyan/30 group-hover:border-neon-cyan/50 transition-colors">
              <Shield className="h-5 w-5 text-neon-cyan" />
              <div className="absolute inset-0 rounded-lg bg-neon-cyan/5 blur-xl group-hover:bg-neon-cyan/10 transition-colors" />
            </div>
            <div>
              <span className="text-lg font-bold gradient-text">SentinelX</span>
              <span className="ml-1 text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Lite</span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "nav-active bg-white/[0.06] text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
                )}
              >
                <item.icon
                  className={cn(
                    "h-[18px] w-[18px] shrink-0 transition-colors",
                    isActive ? "text-neon-cyan" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                <span>{item.title}</span>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-bg"
                    className="absolute inset-0 rounded-lg bg-white/[0.04]"
                    style={{ zIndex: -1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/5 px-4 py-4">
          <div className="flex items-center gap-3 rounded-lg bg-white/[0.03] px-3 py-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 text-xs font-bold text-neon-cyan">
              GL
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">GameLoot Monitor</p>
              <p className="text-[10px] text-muted-foreground">PS5 Consoles</p>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
