"use client";

import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import type { DetectionEvent } from "@/lib/types";

interface DetectionTimelineProps {
  data: DetectionEvent[];
}

const COLORS = ["#00f0ff", "#8b5cf6", "#10b981", "#f59e0b", "#ec4899"];

export function DetectionTimeline({ data }: DetectionTimelineProps) {
  const chartData = data.map((d) => ({
    name: d.time,
    product: d.product,
    price: Number(d.price),
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="glass-card rounded-xl p-5"
    >
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
        Product Detection Timeline
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="name"
              stroke="rgba(255,255,255,0.2)"
              tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              stroke="rgba(255,255,255,0.2)"
              tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(10, 10, 18, 0.95)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "12px",
              }}
              formatter={(value) => [
                `₹${Number(value).toLocaleString("en-IN")}`,
                "Price",
              ]}
              labelFormatter={(label) => `Detected: ${label}`}
            />
            <Bar dataKey="price" radius={[6, 6, 0, 0]} maxBarSize={60}>
              {chartData.map((_entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  fillOpacity={0.7}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
            <div
              className="h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            <span className="truncate max-w-[180px]">{d.product}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
