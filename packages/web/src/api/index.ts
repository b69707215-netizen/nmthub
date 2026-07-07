import { Hono } from 'hono';
import { cors } from "hono/cors"
import { db } from "./database";
import * as schema from "./database/schema";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";
const EXTRA_CHAT_IDS = (process.env.TELEGRAM_CHAT_IDS ?? process.env.TELEGRAM_CHAT_ID ?? "")
  .split(",")
  .map((id) => id.trim())
  .filter(Boolean);

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

async function tgSend(chatId: string, text: string) {
  if (!BOT_TOKEN) {
    console.warn("Telegram bot token is not configured");
    return false;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
    if (!res.ok) {
      console.error("tg send error", await res.text());
      return false;
    }
    return true;
  } catch (e) {
    console.error("tg send error", e);
    return false;
  }
}

const app = new Hono()
  .basePath('api')
  .use(cors({ origin: (origin) => origin ?? "*", credentials: true, exposeHeaders: ["set-auth-token"] }))
  .get('/health', (c) => c.json({ status: 'ok' }, 200))

  // Submit a lead from the website and send it to Telegram subscribers/chat IDs.
  .post('/leads', async (c) => {
    const body = await c.req.json<{ name: string; phone: string; subject?: string; message?: string; type: string }>();
    if (!body.name?.trim() || !body.phone?.trim()) {
      return c.json({ error: "name and phone required" }, 400);
    }

    let lead: typeof schema.leads.$inferSelect | null = null;
    try {
      const inserted = await db.insert(schema.leads).values({
        name: body.name.trim(),
        phone: body.phone.trim(),
        subject: body.subject ?? null,
        message: body.message ?? null,
        type: body.type ?? "lesson",
      }).returning();
      lead = inserted[0] ?? null;
    } catch (e) {
      console.error("lead db insert error", e);
    }

    const typeLabel = body.type === "free" ? "🎁 БЕЗКОШТОВНИЙ УРОК" : "📚 ЗАПИС НА УРОК";
    const msg =
      `<b>${typeLabel}</b>\n\n` +
      `👤 Ім'я: <b>${escapeHtml(body.name.trim())}</b>\n` +
      `📞 Телефон: <b>${escapeHtml(body.phone.trim())}</b>` +
      (body.subject ? `\n📖 Предмет: ${escapeHtml(body.subject)}` : "") +
      (body.message ? `\n💬 Коментар: ${escapeHtml(body.message)}` : "") +
      `\n\n🕐 ${new Date().toLocaleString("uk-UA", { timeZone: "Europe/Kyiv" })}`;

    const chatIds = new Set(EXTRA_CHAT_IDS);
    try {
      const subs = await db.select().from(schema.subscribers);
      subs.forEach((s) => chatIds.add(s.chatId));
    } catch (e) {
      console.error("subscribers db select error", e);
    }

    const results = await Promise.all([...chatIds].map((chatId) => tgSend(chatId, msg)));
    return c.json({ ok: true, lead, sentTo: results.filter(Boolean).length }, 201);
  })

  // Telegram webhook — catches /start and saves chat_id.
  .post('/tg/webhook', async (c) => {
    const update = await c.req.json<any>();
    const message = update?.message;
    if (message?.chat?.id) {
      const chatId = String(message.chat.id);
      try {
        const existing = await db.select().from(schema.subscribers);
        if (!existing.find((s) => s.chatId === chatId)) {
          await db.insert(schema.subscribers).values({
            chatId,
            username: message.from?.username ?? null,
            firstName: message.from?.first_name ?? null,
          });
        }
      } catch (e) {
        console.error("subscriber db error", e);
      }
      await tgSend(chatId, "✅ Ви підписані на заявки з сайту <b>NMTHub</b>. Тепер ви отримуватимете всі нові записи на уроки.");
    }
    return c.json({ ok: true }, 200);
  });

export type AppType = typeof app;
export default app;
