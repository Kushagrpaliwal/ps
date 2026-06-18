"use client";

import { motion } from "framer-motion";
import { Sparkles, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProductSpotlightProps {
  title: string;
  price?: string;
  url?: string;
  detectedAt?: string;
}

export function ProductSpotlight({ title, price, url, detectedAt }: ProductSpotlightProps) {
  const formattedPrice = price
    ? `₹${Number(price).toLocaleString("en-IN")}`
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
      className="glass-card rounded-xl p-5 glow-purple col-span-full lg:col-span-2"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Last Detected Product
        </span>
        <Sparkles className="h-4 w-4 text-neon-purple" />
      </div>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-lg font-semibold text-foreground truncate">{title || "No products detected"}</p>
          <div className="flex items-center gap-3 mt-2">
            {formattedPrice && (
              <Badge variant="secondary" className="bg-neon-purple/10 text-neon-purple border-neon-purple/20 font-mono text-sm">
                {formattedPrice}
              </Badge>
            )}
            {detectedAt && (
              <span className="text-xs text-muted-foreground">
                Detected at {new Date(detectedAt).toLocaleTimeString("en-IN", { hour12: false, timeZone: "Asia/Kolkata" })}
              </span>
            )}
          </div>
        </div>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 flex items-center gap-1.5 rounded-lg bg-white/[0.04] px-3 py-2 text-xs font-medium text-muted-foreground hover:text-neon-cyan hover:bg-neon-cyan/5 transition-colors border border-white/[0.06]"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View
          </a>
        )}
      </div>
    </motion.div>
  );
}
