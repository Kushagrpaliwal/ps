import { sendNotifications } from "./notifier";

async function testEmail() {
  console.log("Testing Gmail notification...");
  const dummyProduct = {
    title: "Test PS5 Console (Email Verification)",
    price: "49990",
    product_url: "https://gameloot.in/",
    image_url: "",
    detected_at: new Date().toISOString(),
    status: "new" as const,
  };

  const results = await sendNotifications(dummyProduct);
  const emailResult = results.find((r) => r.channel === "Email");
  
  if (emailResult?.success) {
    console.log("✅ Successfully sent Email!");
  } else {
    console.error("❌ Failed to send Email:", emailResult?.error);
  }
}

testEmail().catch(console.error);
