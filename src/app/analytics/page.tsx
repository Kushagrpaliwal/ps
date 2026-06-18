"use client";

import { useJsonData } from "@/hooks/use-json-data";
import { ResponseChart } from "@/components/analytics/response-chart";
import { UptimeChart } from "@/components/analytics/uptime-chart";
import { DetectionTimeline } from "@/components/analytics/detection-timeline";
import type { AnalyticsData } from "@/lib/types";
import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  const { data: analytics, loading } = useJsonData<AnalyticsData>("/analytics.json");

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-neon-cyan" />
          Analytics
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Performance metrics and detection history
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card rounded-xl h-80 animate-pulse" />
          ))}
        </div>
      ) : analytics ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ResponseChart data={analytics.responseTimeHistory} />
          <UptimeChart data={analytics.uptimeHistory} />
          <div className="lg:col-span-2">
            <DetectionTimeline data={analytics.detectionTimeline} />
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-xl p-12 text-center">
          <p className="text-lg font-semibold">No analytics data available</p>
          <p className="text-sm text-muted-foreground mt-2">
            Data will appear after the first monitoring run
          </p>
        </div>
      )}
    </div>
  );
}
