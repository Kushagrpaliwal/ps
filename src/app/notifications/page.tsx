"use client";

import { useJsonData } from "@/hooks/use-json-data";
import type { AnalyticsData, NotificationRecord } from "@/lib/types";
import { motion } from "framer-motion";
import { Bell, Send, Mail, MessageCircle, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const channelIcons: Record<NotificationRecord["channel"], typeof Send> = {
  email: Mail,
  discord: MessageCircle,
};

const channelColors: Record<NotificationRecord["channel"], string> = {
  email: "text-neon-red",
  discord: "text-indigo-400",
};

export default function NotificationsPage() {
  const { data: analytics } = useJsonData<AnalyticsData>("/analytics.json");
  const notifications = analytics?.notificationHistory ?? [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Bell className="h-6 w-6 text-neon-yellow" />
          Notifications
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Notification delivery history
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-card rounded-xl overflow-hidden"
      >
        {notifications.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-lg font-semibold">No notifications sent yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Alerts will appear here when new products are detected
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {[...notifications].reverse().map((notif, i) => {
              const channelKey = (notif.channel || "").toLowerCase() as NotificationRecord["channel"];
              const ChannelIcon = channelIcons[channelKey] || Bell;
              const time = new Date(notif.timestamp).toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              });
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div className={`shrink-0 ${channelColors[channelKey] || "text-muted-foreground"}`}>
                    <ChannelIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {notif.product}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {notif.message}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={
                      notif.status === "sent"
                        ? "bg-neon-green/10 text-neon-green border-neon-green/20"
                        : "bg-neon-red/10 text-neon-red border-neon-red/20"
                    }
                  >
                    {notif.status === "sent" ? (
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                    ) : (
                      <XCircle className="h-3 w-3 mr-1" />
                    )}
                    {notif.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-mono shrink-0">
                    {time}
                  </span>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
