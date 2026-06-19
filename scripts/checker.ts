import "dotenv/config";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

// Add stealth plugin and use defaults (all evasion techniques)
puppeteer.use(StealthPlugin());
import * as cheerio from "cheerio";
import * as fs from "fs";
import * as path from "path";
import { sendNotifications } from "./notifier";

// === TYPES ===
interface Product {
  title: string;
  price: string;
  product_url: string;
  image_url: string;
  detected_at: string;
  status: "new" | "existing";
}

interface MonitorStatus {
  websiteOnline: boolean;
  lastCheck: string;
  responseTime: number;
  productsFound: number;
  lastDetectedProduct: string;
  lastNewProductAt: string;
}

interface LogEntry {
  timestamp: string;
  message: string;
  level: "info" | "warn" | "error" | "success";
}

interface AnalyticsDataPoint {
  time: string;
  value: number;
}

interface DetectionEvent {
  time: string;
  product: string;
  price: string;
}

interface NotificationRecord {
  timestamp: string;
  channel: "email" | "discord";
  product: string;
  status: "sent" | "failed";
  message: string;
}

interface AnalyticsData {
  responseTimeHistory: AnalyticsDataPoint[];
  uptimeHistory: AnalyticsDataPoint[];
  detectionTimeline: DetectionEvent[];
  notificationHistory: NotificationRecord[];
}

// === CONFIG ===
const TARGET_URL =
  "https://gameloot.in/product-category/ps5-consoles/?swoof=1&stock=instock&really_curr_tax=183-product_cat";
const REQUEST_TIMEOUT = 15000;
const MAX_RETRIES = 3;
const MAX_LOGS = 100;

const PUBLIC_DIR = path.join(process.cwd(), "public");
const PRODUCTS_FILE = path.join(PUBLIC_DIR, "products.json");
const STATUS_FILE = path.join(PUBLIC_DIR, "status.json");
const LOGS_FILE = path.join(PUBLIC_DIR, "logs.json");
const ANALYTICS_FILE = path.join(PUBLIC_DIR, "analytics.json");

// === HELPERS ===


function nowISOString(): string {
  return new Date().toISOString();
}

function timeIST(): string {
  return new Date().toLocaleTimeString("en-IN", {
    hour12: false,
    timeZone: "Asia/Kolkata",
  });
}

function dateIST(): string {
  return new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Kolkata",
  });
}

function readJSON<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }
  } catch (e) {
    console.error(`Error reading ${filePath}:`, e);
  }
  return fallback;
}

function writeJSON(filePath: string, data: unknown): void {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

// === LOG MANAGEMENT ===
const logs: LogEntry[] = readJSON<LogEntry[]>(LOGS_FILE, []);

function log(message: string, level: LogEntry["level"] = "info"): void {
  const entry: LogEntry = {
    timestamp: nowISOString(),
    message,
    level,
  };
  logs.push(entry);
  console.log(`[${timeIST()}] [${level.toUpperCase()}] ${message}`);
}

function saveLogs(): void {
  // Keep only the last MAX_LOGS entries
  const trimmed = logs.slice(-MAX_LOGS);
  writeJSON(LOGS_FILE, trimmed);
}

// === FETCH WITH RETRY ===
async function fetchWithRetry(
  url: string,
  retries: number = MAX_RETRIES
): Promise<{ html: string; responseTime: number }> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const start = Date.now();
      
      const browser = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--disable-gpu",
        ],
      });
      
      const page = await browser.newPage();
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      );
      
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: REQUEST_TIMEOUT });
      const html = await page.content();
      await browser.close();
      
      const responseTime = Date.now() - start;
      return { html, responseTime };
    } catch (error) {
      const err = error as Error;
      if (attempt < retries) {
        const delay = Math.pow(2, attempt) * 500; // Exponential backoff: 1s, 2s, 4s
        log(
          `⚠️ Request failed (attempt ${attempt}/${retries}): ${err.message} — retrying in ${delay}ms`,
          "warn"
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  throw new Error("Should not reach here");
}

// === PARSE PRODUCTS ===
function parseProducts(html: string): Omit<Product, "detected_at" | "status">[] {
  const $ = cheerio.load(html);
  const products: Omit<Product, "detected_at" | "status">[] = [];

  // WooCommerce product card selectors
  $("li.product, .product-grid-item, .products .product, .product_item").each((_i, el) => {
    const $el = $(el);

    // Title extraction — try multiple selectors
    const title =
      $el.find(".woocommerce-loop-product__title").first().text().trim() ||
      $el.find(".product-title").first().text().trim() ||
      $el.find("h2").first().text().trim() ||
      $el.find("h3").first().text().trim() ||
      $el.find(".product_details h5").first().text().trim() ||
      "";

    // Price — GameLoot uses .product_price with format "Rs. X Rs. Y" (original + sale)
    // We want the last price (sale/current price)
    let price = "";
    const productPriceText = $el.find(".product_price").first().text().trim();
    if (productPriceText) {
      // Extract all numeric values from the text (e.g., "Rs. 21,999 Rs. 13,999")
      const priceMatches = productPriceText.match(/[\d,]+/g);
      if (priceMatches && priceMatches.length > 0) {
        // Take the last price (sale price), remove commas
        price = priceMatches[priceMatches.length - 1].replace(/,/g, "");
      }
    }
    
    // Fallback: try standard WooCommerce price selectors
    if (!price) {
      const wcPriceText =
        $el.find(".price ins .amount, .price ins .woocommerce-Price-amount").first().text().trim() ||
        $el.find(".price .amount, .price .woocommerce-Price-amount").first().text().trim() ||
        "";
      price = wcPriceText.replace(/[^\d.]/g, "");
    }

    // Product URL
    const product_url =
      $el.find("a.woocommerce-LoopProduct-link").first().attr("href") ||
      $el.find("a").first().attr("href") ||
      "";

    // Image URL — handle protocol-relative URLs
    let image_url =
      $el.find("img").first().attr("data-src") ||
      $el.find("img").first().attr("src") ||
      "";
    if (image_url.startsWith("//")) {
      image_url = `https:${image_url}`;
    }

    if (title && product_url) {
      products.push({ title, price, product_url, image_url });
    }
  });

  return products;
}

// === MAIN CHECKER ===
async function main(): Promise<void> {
  log("🔍 Fetch started — gameloot.in/product-category/ps5-consoles");

  let responseTime = 0;
  let websiteOnline = false;
  let currentProducts: Omit<Product, "detected_at" | "status">[] = [];

  try {
    const result = await fetchWithRetry(TARGET_URL);
    responseTime = result.responseTime;
    websiteOnline = true;
    log(`✅ HTML received — 200 OK (${responseTime}ms)`, "success");

    currentProducts = parseProducts(result.html);
    log(`📦 Parsed ${currentProducts.length} product cards from page`);
  } catch (error) {
    const err = error as Error;
    log(`❌ Failed to fetch page: ${err.message}`, "error");
    websiteOnline = false;

    // Update status to offline
    const status: MonitorStatus = {
      websiteOnline: false,
      lastCheck: timeIST(),
      responseTime: 0,
      productsFound: 0,
      lastDetectedProduct: "",
      lastNewProductAt: "",
    };
    writeJSON(STATUS_FILE, status);
    saveLogs();
    // process.exit(1); // Do not fail the CI job so we can see logs and commit the offline status
  }

  // Load existing products
  const existingProducts = readJSON<Product[]>(PRODUCTS_FILE, []);
  const existingUrls = new Set(existingProducts.map((p) => p.product_url));
  log(`🔄 Comparing against ${existingProducts.length} known products`);

  // Detect new products
  const newProducts: Product[] = [];
  const allProducts: Product[] = [];

  for (const product of currentProducts) {
    const isNew = !existingUrls.has(product.product_url);
    const fullProduct: Product = {
      ...product,
      detected_at: nowISOString(),
      status: isNew ? "new" : "existing",
    };

    if (isNew) {
      newProducts.push(fullProduct);
      const formattedPrice = product.price
        ? `₹${Number(product.price).toLocaleString("en-IN")}`
        : "Price N/A";
      log(
        `🚨 NEW PRODUCT: ${product.title} — ${formattedPrice}`,
        "success"
      );
    }

    allProducts.push(fullProduct);
  }

  // Load analytics
  const analytics = readJSON<AnalyticsData>(ANALYTICS_FILE, {
    responseTimeHistory: [],
    uptimeHistory: [],
    detectionTimeline: [],
    notificationHistory: [],
  });

  // Send notifications for new products
  if (newProducts.length > 0) {
    for (const product of newProducts) {
      const notifResults = await sendNotifications(product);
      for (const result of notifResults) {
        log(
          result.success
            ? `📨 ${result.channel} alert sent successfully`
            : `⚠️ ${result.channel} alert failed: ${result.error}`,
          result.success ? "success" : "warn"
        );

        // Record notification
        analytics.notificationHistory.push({
          timestamp: nowISOString(),
          channel: result.channel as NotificationRecord["channel"],
          product: product.title,
          status: result.success ? "sent" : "failed",
          message: result.success
            ? `Alert delivered to ${result.channel}`
            : `Failed: ${result.error}`,
        });
      }

      // Add detection event
      analytics.detectionTimeline.push({
        time: dateIST(),
        product: product.title,
        price: product.price,
      });
    }
  } else {
    log("✓ No new products detected");
  }

  // Update products.json
  writeJSON(PRODUCTS_FILE, allProducts);
  log(`💾 Updated products.json (${allProducts.length} products)`);

  // Update status.json
  const lastNewProduct =
    newProducts.length > 0
      ? newProducts[newProducts.length - 1]
      : existingProducts.find((p) => p.status === "new") || allProducts[0];

  const status: MonitorStatus = {
    websiteOnline,
    lastCheck: timeIST(),
    responseTime,
    productsFound: allProducts.length,
    lastDetectedProduct: lastNewProduct?.title ?? "",
    lastNewProductAt: lastNewProduct?.detected_at ?? "",
  };
  writeJSON(STATUS_FILE, status);

  // Update analytics.json
  analytics.responseTimeHistory.push({
    time: timeIST(),
    value: responseTime,
  });
  // Keep last 288 entries (24h at 5-min intervals)
  analytics.responseTimeHistory = analytics.responseTimeHistory.slice(-288);

  // Trim notification history to last 100
  analytics.notificationHistory = analytics.notificationHistory.slice(-100);

  writeJSON(ANALYTICS_FILE, analytics);
  log("📊 Updated status.json and analytics.json");

  saveLogs();
  console.log("\n✅ Check complete.");
}
// === ENTRY POINT ===
const CHECK_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

const isOnceMode = process.argv.includes("--once");

if (isOnceMode) {
  // Single run (for GitHub Actions cron)
  main().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  });
} else {
  // Continuous loop mode (for local monitoring)
  async function loop() {
    console.log("🔁 SentinelX Monitor started — checking every 5 minutes");
    console.log("   Press Ctrl+C to stop\n");

    while (true) {
      try {
        await main();
      } catch (err) {
        console.error("⚠️ Check failed, will retry next cycle:", err);
      }

      const nextCheck = new Date(Date.now() + CHECK_INTERVAL_MS).toLocaleTimeString("en-IN", {
        hour12: false,
        timeZone: "Asia/Kolkata",
      });
      console.log(`\n⏳ Next check at ${nextCheck} IST — waiting 5 minutes...\n`);
      await new Promise((resolve) => setTimeout(resolve, CHECK_INTERVAL_MS));
    }
  }

  loop();
}
