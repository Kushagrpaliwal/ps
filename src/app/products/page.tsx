"use client";

import { useJsonData } from "@/hooks/use-json-data";
import { ProductGrid } from "@/components/products/product-grid";
import type { Product } from "@/lib/types";
import { Package } from "lucide-react";

export default function ProductsPage() {
  const { data: products, loading } = useJsonData<Product[]>("/products.json");

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Package className="h-6 w-6 text-neon-purple" />
            Products
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            All detected PS5 products from GameLoot.in
          </p>
        </div>
        {products && (
          <span className="text-sm text-muted-foreground font-mono">
            {products.length} product{products.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="glass-card rounded-xl h-80 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <ProductGrid products={products ?? []} />
      )}
    </div>
  );
}
