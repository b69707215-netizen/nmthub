// Standalone polling fallback — собирает chat_id всех кто нажал /start.
// Запускается отдельно: bun run src/api/tg-poller.ts
// На проде лучше webhook (/api/tg/webhook), но polling работает всегда.
import { db } from "./database";
import * as schema from "./database/schema";

const BOT_TOKEN = "8986037946:AAFdhm3TKx_u3d5L9fH37_VvNvltujDcVMg";
let offset = 0;

async function tgSend(chatId: string, text: string) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
}

async function poll() {
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${offset}&timeout=30`);
    const data = await res.json() as any;
    for (const u of data.result ?? []) {
      offset = u.update_id + 1;
      const message = u.message;
      if (message?.chat?.id) {
        const chatId = String(message.chat.id);
        const existing = await db.select().from(schema.subscribers);
        if (!existing.find((s) => s.chatId === chatId)) {
          await db.insert(schema.subscribers).values({
            chatId,
            username: message.from?.username ?? null,
            firstName: message.from?.first_name ?? null,
          });
          await tgSend(chatId, "✅ Ви підписані на заявки з сайту <b>NMTHub</b>. Тепер ви отримуватимете всі нові записи на уроки та безкоштовні заняття.");
          console.log("New subscriber:", chatId, message.from?.username);
        }
      }
    }
  } catch (e) {
    console.error("poll error", e);
  }
  setTimeout(poll, 1000);
}

console.log("TG poller started — слушаю /start...");
poll();
