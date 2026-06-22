import { Hono } from 'hono';
import { cors } from "hono/cors"
import { db } from "./database";
import * as schema from "./database/schema";

const BOT_TOKEN = "8986037946:AAFdhm3TKx_u3d5L9fH37_VvNvltujDcVMg";

async function tgSend(chatId: string, text: string) {
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
  } catch (e) {
    console.error("tg send error", e);
  }
}

const app = new Hono()
  .basePath('api')
  .use(cors({ origin: (origin) => origin ?? "*", credentials: true, exposeHeaders: ["set-auth-token"] }))
  .get('/health', (c) => c.json({ status: 'ok' }, 200))

  // Submit a lead from the website — рассылается всем подписчикам бота
  .post('/leads', async (c) => {
    const body = await c.req.json<{ name: string; phone: string; subject?: string; message?: string; type: string }>();
    if (!body.name || !body.phone) {
      return c.json({ error: "name and phone required" }, 400);
    }

    const [lead] = await db.insert(schema.leads).values({
      name: body.name,
      phone: body.phone,
      subject: body.subject ?? null,
      message: body.message ?? null,
      type: body.type ?? "lesson",
    }).returning();

    // Формируем сообщение
    const typeLabel = body.type === "free" ? "🎁 БЕЗКОШТОВНИЙ УРОК" : "📚 ЗАПИС НА УРОК";
    const msg =
      `<b>${typeLabel}</b>\n\n` +
      `👤 Ім'я: <b>${body.name}</b>\n` +
      `📞 Телефон: <b>${body.phone}</b>` +
      (body.subject ? `\n📖 Предмет: ${body.subject}` : "") +
      (body.message ? `\n💬 Коментар: ${body.message}` : "") +
      `\n\n🕐 ${new Date().toLocaleString("uk-UA", { timeZone: "Europe/Kiev" })}`;

    // Рассылаем всем кто нажал /start
    const subs = await db.select().from(schema.subscribers);
    await Promise.all(subs.map((s) => tgSend(s.chatId, msg)));

    return c.json({ ok: true, lead, sentTo: subs.length }, 201);
  })

  // Telegram webhook — ловит /start и сохраняет chat_id
  .post('/tg/webhook', async (c) => {
    const update = await c.req.json<any>();
    const message = update?.message;
    if (message?.chat?.id) {
      const chatId = String(message.chat.id);
      const existing = await db.select().from(schema.subscribers);
      if (!existing.find((s) => s.chatId === chatId)) {
        await db.insert(schema.subscribers).values({
          chatId,
          username: message.from?.username ?? null,
          firstName: message.from?.first_name ?? null,
        });
        await tgSend(chatId, "✅ Ви підписані на заявки з сайту <b>NMTHub</b>. Тепер ви отримуватимете всі нові записи на уроки.");
      }
    }
    return c.json({ ok: true }, 200);
  });

export type AppType = typeof app;
export default app;
