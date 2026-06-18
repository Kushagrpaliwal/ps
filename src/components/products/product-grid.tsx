"use client";

import { ProductCard } from "./product-card";
import type { Product } from "@/lib/types";

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="glass-card rounded-xl p-12 text-center">
        <p className="text-4xl mb-4">📦</p>
        <p className="text-lg font-semibold text-foreground">No products detected</p>
        <p className="text-sm text-muted-foreground mt-2">
          Products will appear here when they&apos;re found in stock on GameLoot.in
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product, i) => (
        <ProductCard key={product.product_url} product={product} index={i} />
      ))}
    </div>
  );
}
