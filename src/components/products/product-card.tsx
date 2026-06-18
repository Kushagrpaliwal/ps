"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
  index: number;
}

export function ProductCard({ product, index }: ProductCardProps) {
  const [imgError, setImgError] = useState(false);
  const formattedPrice = `₹${Number(product.price).toLocaleString("en-IN")}`;
  const isNew = product.status === "new";
  const detectedTime = new Date(product.detected_at).toLocaleTimeString("en-IN", {
    hour12: false,
    timeZone: "Asia/Kolkata",
  });
  const detectedDate = new Date(product.detected_at).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Kolkata",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`glass-card rounded-xl overflow-hidden group ${isNew ? "glow-cyan" : ""}`}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-white/[0.03] to-white/[0.01] overflow-hidden">
        {imgError || !product.image_url ? (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl">🎮</span>
          </div>
        ) : (
          <Image
            src={product.image_url}
            alt={product.title}
            fill
            unoptimized
            className="object-contain p-6 group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        )}
        {/* Status badge */}
        <div className="absolute top-3 right-3">
          <Badge
            className={
              isNew
                ? "bg-neon-cyan/15 text-neon-cyan border-neon-cyan/30 font-semibold"
                : "bg-white/5 text-muted-foreground border-white/10"
            }
          >
            {isNew ? "✦ NEW" : "EXISTING"}
          </Badge>
        </div>
      </div>

      {/* Details */}
      <div className="p-4 space-y-3">
        <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-snug min-h-[2.5rem]">
          {product.title}
        </h3>

        <div className="flex items-center justify-between">
          <span className="text-xl font-bold gradient-text font-mono">
            {formattedPrice}
          </span>
          <a
            href={product.product_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-lg bg-white/[0.04] px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-neon-cyan hover:bg-neon-cyan/5 transition-colors border border-white/[0.06]"
          >
            <ExternalLink className="h-3 w-3" />
            Buy
          </a>
        </div>

        <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-white/5">
          <span>Detected {detectedDate}</span>
          <span className="font-mono">{detectedTime} IST</span>
        </div>
      </div>
    </motion.div>
  );
}
