"use client";

import { motion } from "framer-motion";
import { Settings, Globe, Clock, Bell, Send, Mail, MessageCircle, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const TARGET_URL =
  "https://gameloot.in/product-category/ps5-consoles/?swoof=1&stock=instock&really_curr_tax=183-product_cat";

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-6 w-6 text-muted-foreground" />
          Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitoring agent configuration
        </p>
      </div>

      {/* General Settings */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-card rounded-xl p-6 space-y-5"
      >
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Globe className="h-4 w-4 text-neon-cyan" />
          General
        </h2>
        <Separator className="bg-white/5" />

        <SettingRow
          label="Target URL"
          value={TARGET_URL}
          isMono
        />
        <SettingRow
          label="Scrape Interval"
          value="Every 5 minutes"
          icon={<Clock className="h-3.5 w-3.5" />}
        />
        <SettingRow
          label="Request Timeout"
          value="3000 ms"
        />
        <SettingRow
          label="Max Retries"
          value="3 (with exponential backoff)"
        />
        <SettingRow
          label="Scheduler"
          value="GitHub Actions Cron"
          badge="Free Tier"
        />
      </motion.div>

      {/* Notification Channels */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="glass-card rounded-xl p-6 space-y-5"
      >
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Bell className="h-4 w-4 text-neon-yellow" />
          Notification Channels
        </h2>
        <Separator className="bg-white/5" />

        <ChannelRow
          icon={<Send className="h-4 w-4 text-blue-400" />}
          name="Telegram"
          description="Bot API notifications"
          configured
          envVars={["TELEGRAM_BOT_TOKEN", "TELEGRAM_CHAT_ID"]}
        />
        <ChannelRow
          icon={<Mail className="h-4 w-4 text-neon-red" />}
          name="Gmail SMTP"
          description="Email alerts via App Password"
          configured={false}
          envVars={["GMAIL_USER", "GMAIL_APP_PASSWORD", "GMAIL_TO"]}
        />
        <ChannelRow
          icon={<MessageCircle className="h-4 w-4 text-indigo-400" />}
          name="Discord"
          description="Webhook notifications"
          configured={false}
          envVars={["DISCORD_WEBHOOK_URL"]}
        />
      </motion.div>

      {/* Data Storage */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="glass-card rounded-xl p-6 space-y-5"
      >
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Shield className="h-4 w-4 text-neon-green" />
          Data Storage
        </h2>
        <Separator className="bg-white/5" />

        <SettingRow label="Storage Type" value="Local JSON Files (Git-committed)" />
        <SettingRow label="Database" value="None — zero cost" badge="Free" />
        <SettingRow label="Hosting" value="Vercel / Cloudflare Pages (Static Export)" badge="Free" />
      </motion.div>
    </div>
  );
}

function SettingRow({
  label,
  value,
  badge,
  icon,
  isMono,
}: {
  label: string;
  value: string;
  badge?: string;
  icon?: React.ReactNode;
  isMono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2 text-right">
        {icon}
        <span
          className={`text-sm text-foreground ${isMono ? "font-mono text-xs break-all max-w-xs text-right" : ""}`}
        >
          {value}
        </span>
        {badge && (
          <Badge variant="secondary" className="bg-neon-green/10 text-neon-green border-neon-green/20 text-[10px]">
            {badge}
          </Badge>
        )}
      </div>
    </div>
  );
}

function ChannelRow({
  icon,
  name,
  description,
  configured,
  envVars,
}: {
  icon: React.ReactNode;
  name: string;
  description: string;
  configured: boolean;
  envVars: string[];
}) {
  return (
    <div className="flex items-start gap-4 rounded-lg bg-white/[0.02] p-4">
      <div className="shrink-0 mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{name}</span>
          <Badge
            variant="secondary"
            className={
              configured
                ? "bg-neon-green/10 text-neon-green border-neon-green/20 text-[10px]"
                : "bg-white/5 text-muted-foreground border-white/10 text-[10px]"
            }
          >
            {configured ? "Configured" : "Not configured"}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {envVars.map((v) => (
            <code
              key={v}
              className="text-[10px] font-mono bg-white/[0.04] px-1.5 py-0.5 rounded text-muted-foreground border border-white/5"
            >
              {v}
            </code>
          ))}
        </div>
      </div>
    </div>
  );
}
