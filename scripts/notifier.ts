import axios from "axios";
import nodemailer from "nodemailer";

interface Product {
  title: string;
  price: string;
  product_url: string;
  image_url: string;
  detected_at: string;
  status: "new" | "existing";
}

interface NotificationResult {
  channel: string;
  success: boolean;
  error?: string;
}

// === TELEGRAM ===
async function sendTelegram(product: Product): Promise<NotificationResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return { channel: "Telegram", success: false, error: "Not configured (missing env vars)" };
  }

  const formattedPrice = product.price
    ? `₹${Number(product.price).toLocaleString("en-IN")}`
    : "Price N/A";

  const detectedTime = new Date(product.detected_at).toLocaleTimeString("en-IN", {
    hour12: false,
    timeZone: "Asia/Kolkata",
  });

  const message = `
🚨 *GAMELOOT STOCK ALERT*

*New Product Found*

📦 *Product:*
${product.title}

💰 *Price:*
${formattedPrice}

🔗 *Link:*
${product.product_url}

🕐 *Detected:*
${detectedTime} IST

_Powered by SentinelX Lite_
`.trim();

  try {
    await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
      chat_id: chatId,
      text: message,
      parse_mode: "Markdown",
      disable_web_page_preview: false,
    });
    return { channel: "Telegram", success: true };
  } catch (error) {
    const err = error as Error;
    return { channel: "Telegram", success: false, error: err.message };
  }
}

// === EMAIL (Gmail SMTP) ===
async function sendEmail(product: Product): Promise<NotificationResult> {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  const to = process.env.GMAIL_TO;

  if (!user || !pass || !to) {
    return { channel: "Email", success: false, error: "Not configured (missing env vars)" };
  }

  const formattedPrice = product.price
    ? `₹${Number(product.price).toLocaleString("en-IN")}`
    : "Price N/A";

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; background: #0a0a0f; color: #fff; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
      <div style="background: linear-gradient(135deg, #00f0ff20, #8b5cf620); padding: 24px; text-align: center;">
        <h1 style="margin: 0; font-size: 18px; color: #00f0ff;">🚨 GAMELOOT STOCK ALERT</h1>
        <p style="margin: 8px 0 0; font-size: 13px; color: rgba(255,255,255,0.6);">New Product Detected by SentinelX</p>
      </div>
      <div style="padding: 24px;">
        <h2 style="margin: 0 0 8px; font-size: 16px; color: #fff;">${product.title}</h2>
        <p style="margin: 0 0 16px; font-size: 24px; font-weight: bold; color: #00f0ff;">${formattedPrice}</p>
        <a href="${product.product_url}" style="display: inline-block; background: linear-gradient(135deg, #00f0ff, #8b5cf6); color: #000; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
          View Product →
        </a>
      </div>
      <div style="padding: 16px 24px; border-top: 1px solid rgba(255,255,255,0.05); font-size: 11px; color: rgba(255,255,255,0.4);">
        Powered by SentinelX Lite • Zero Cost Monitoring
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"SentinelX Lite" <${user}>`,
      to,
      subject: `🚨 PS5 Alert: ${product.title} — ${formattedPrice}`,
      html,
    });
    return { channel: "Email", success: true };
  } catch (error) {
    const err = error as Error;
    return { channel: "Email", success: false, error: err.message };
  }
}

// === DISCORD ===
async function sendDiscord(product: Product): Promise<NotificationResult> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  const botToken = process.env.DISCORD_BOT_TOKEN;
  const userId = process.env.DISCORD_USER_ID;

  if (!webhookUrl && (!botToken || !userId)) {
    return { channel: "Discord", success: false, error: "Not configured (missing env vars)" };
  }

  const formattedPrice = product.price
    ? `₹${Number(product.price).toLocaleString("en-IN")}`
    : "Price N/A";

  const detectedTime = new Date(product.detected_at).toLocaleTimeString("en-IN", {
    hour12: false,
    timeZone: "Asia/Kolkata",
  });

  const embed = {
    embeds: [
      {
        title: "🚨 GAMELOOT STOCK ALERT",
        description: `**New Product Found**`,
        color: 0x00f0ff,
        fields: [
          { name: "📦 Product", value: product.title, inline: false },
          { name: "💰 Price", value: formattedPrice, inline: true },
          { name: "🕐 Detected", value: `${detectedTime} IST`, inline: true },
        ],
        url: product.product_url,
        thumbnail: product.image_url ? { url: product.image_url } : undefined,
        footer: { text: "Powered by SentinelX Lite" },
        timestamp: product.detected_at,
      },
    ],
  };

  try {
    if (botToken && userId) {
      // 1. Create DM channel
      const dmChannelResponse = await axios.post(
        "https://discord.com/api/v10/users/@me/channels",
        { recipient_id: userId },
        { headers: { Authorization: `Bot ${botToken}`, "Content-Type": "application/json" } }
      );
      
      const channelId = dmChannelResponse.data.id;

      // 2. Send message
      await axios.post(
        `https://discord.com/api/v10/channels/${channelId}/messages`,
        embed,
        { headers: { Authorization: `Bot ${botToken}`, "Content-Type": "application/json" } }
      );
    } else if (webhookUrl) {
      // Fallback to webhook
      await axios.post(webhookUrl, embed);
    }

    return { channel: "Discord", success: true };
  } catch (error: any) {
    const errorMsg = error.response?.data ? JSON.stringify(error.response.data) : error.message;
    return { channel: "Discord", success: false, error: errorMsg };
  }
}

// === SEND ALL ===
export async function sendNotifications(
  product: Product
): Promise<NotificationResult[]> {
  const results = await Promise.allSettled([
    sendTelegram(product),
    sendEmail(product),
    sendDiscord(product),
  ]);

  return results.map((result) => {
    if (result.status === "fulfilled") {
      return result.value;
    }
    return { channel: "Unknown", success: false, error: String(result.reason) };
  });
}
