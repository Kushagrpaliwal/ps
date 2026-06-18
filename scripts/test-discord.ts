import { sendNotifications } from "./notifier";

async function testDiscord() {
  console.log("Testing Discord notification...");
  const dummyProduct = {
    title: "Test PS5 Console (Discord Verification)",
    price: "49990",
    product_url: "https://gameloot.in/",
    image_url: "",
    detected_at: new Date().toISOString(),
    status: "new" as const,
  };

  const results = await sendNotifications(dummyProduct);
  const discordResult = results.find((r) => r.channel === "Discord");
  
  if (discordResult?.success) {
    console.log("✅ Successfully sent Discord DM!");
  } else {
    console.error("❌ Failed to send Discord DM:", discordResult?.error);
  }
}

testDiscord().catch(console.error);
