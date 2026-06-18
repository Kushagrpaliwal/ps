"use client";

import { Clock, Zap, Package } from "lucide-react";
import { StatusCard } from "./status-card";
import { MetricCard } from "./metric-card";
import { ProductSpotlight } from "./product-spotlight";
import type { MonitorStatus, Product } from "@/lib/types";

interface StatsGridProps {
  status: MonitorStatus | null;
  products: Product[] | null;
}

export function StatsGrid({ status, products }: StatsGridProps) {
  const latestNewProduct = products?.find((p) => p.status === "new");

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <StatusCard online={status?.websiteOnline ?? false} />

      <MetricCard
        title="Response Time"
        value={status ? `${status.responseTime} ms` : "—"}
        subtitle={
          status
            ? status.responseTime < 300
              ? "Performance is excellent"
              : "Slower than usual"
            : "Loading..."
        }
        icon={Zap}
        iconColor="text-neon-yellow"
        delay={0.1}
      />

      <MetricCard
        title="Products Found"
        value={status ? `${status.productsFound}` : "—"}
        subtitle="Currently in stock"
        icon={Package}
        iconColor="text-neon-purple"
        delay={0.15}
      />

      <MetricCard
        title="Last Check"
        value={status?.lastCheck ?? "—"}
        subtitle="IST timezone"
        icon={Clock}
        iconColor="text-neon-cyan"
        delay={0.2}
      />

      <ProductSpotlight
        title={status?.lastDetectedProduct ?? ""}
        price={latestNewProduct?.price}
        url={latestNewProduct?.product_url}
        detectedAt={status?.lastNewProductAt}
      />
    </div>
  );
}
