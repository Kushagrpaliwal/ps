export interface Product {
  title: string;
  price: string;
  product_url: string;
  image_url: string;
  detected_at: string;
  status: "new" | "existing";
}

export interface MonitorStatus {
  websiteOnline: boolean;
  lastCheck: string;
  responseTime: number;
  productsFound: number;
  lastDetectedProduct: string;
  lastNewProductAt: string;
}

export interface LogEntry {
  timestamp: string;
  message: string;
  level: "info" | "warn" | "error" | "success";
}

export interface AnalyticsDataPoint {
  time: string;
  value: number;
}

export interface DetectionEvent {
  time: string;
  product: string;
  price: string;
}

export interface NotificationRecord {
  timestamp: string;
  channel: "email" | "discord";
  product: string;
  status: "sent" | "failed";
  message: string;
}

export interface AnalyticsData {
  responseTimeHistory: AnalyticsDataPoint[];
  uptimeHistory: AnalyticsDataPoint[];
  detectionTimeline: DetectionEvent[];
  notificationHistory: NotificationRecord[];
}
