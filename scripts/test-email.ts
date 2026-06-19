import "dotenv/config";
import { sendNotifications } from "./notifier.js";

async function test() {
  console.log("Testing Email notification...");
  const testProduct = {
    title: "TEST: PlayStation 5 (Email Test)",
    price: "49990",
    product_url: "https://gameloot.in",
    image_url: "https://gameloot.in/wp-content/uploads/2023/02/LogoGameLoot.jpg",
    detected_at: new Date().toISOString(),
    status: "new" as const
  };
  
  const results = await sendNotifications(testProduct);
  console.log(JSON.stringify(results, null, 2));
}

test().catch(console.error);
