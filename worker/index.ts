type D1Result<T = unknown> = { results?: T[] };
type D1DatabaseLike = {
  prepare: (query: string) => {
    bind: (...values: unknown[]) => {
      all: <T = unknown>() => Promise<D1Result<T>>;
      run: () => Promise<unknown>;
      first: <T = unknown>() => Promise<T | null>;
    };
    all: <T = unknown>() => Promise<D1Result<T>>;
    run: () => Promise<unknown>;
  };
};

type Env = {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
  DB?: D1DatabaseLike;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
  TELEGRAM_CHAT_IDS?: string;
};

function clean(value: unknown, max = 500) {
  return String(value ?? "").trim().slice(0, max);
}

function escapeHtml(value: unknown) {
  return clean(value, 1000)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function getRawChatIds(env: Env) {
  return (env.TELEGRAM_CHAT_IDS || env.TELEGRAM_CHAT_ID || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

function getValidChatIds(env: Env) {
  return getRawChatIds(env).filter((id) => /^-?\d+$/.test(id));
}

async function notifyTelegram(env: Env, text: string) {
  const token = clean(env.TELEGRAM_BOT_TOKEN, 220);
  const rawChatIds = getRawChatIds(env);
  const chatIds = getValidChatIds(env);

  if (!token || !token.includes(":")) {
    return { ok: false, delivered: 0, error: "telegram_bot_token_missing_or_invalid" };
  }

  if (rawChatIds.length === 0) {
    return { ok: false, delivered: 0, error: "telegram_chat_id_missing" };
  }

  if (chatIds.length === 0) {
    return { ok: false, delivered: 0, error: "telegram_chat_id_must_be_number" };
  }

  const results = await Promise.allSettled(
    chatIds.map(async (chatId) => {
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
      });
      const data = await response.json().catch(() => ({}));
      return { ok: response.ok, data };
    }),
  );

  const delivered = results.filter((result) => result.status === "fulfilled" && result.value.ok).length;
  const failed = results.length - delivered;
  return { ok: delivered > 0, delivered, failed, error: delivered > 0 ? null : "telegram_send_failed" };
}

async function sendLead(request: Request, env: Env) {
  if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  const body = await request.json().catch(() => ({}));
  const name = clean((body as Record<string, unknown>).name, 80) || "Не вказано";
  const phone = clean((body as Record<string, unknown>).phone, 80) || "Не вказано";
  const subject = clean((body as Record<string, unknown>).subject, 80) || "Не вказано";
  const score = clean((body as Record<string, unknown>).score, 40) || "Не вказано";
  const type = clean((body as Record<string, unknown>).type || "Заявка", 60);

  const text = [
    `<b>${escapeHtml(type)} NMTHub</b>`,
    `Ім'я: ${escapeHtml(name)}`,
    `Телефон: ${escapeHtml(phone)}`,
    `Предмет / курс: ${escapeHtml(subject)}`,
    `Тест / ціна: ${escapeHtml(score)}`,
  ].join("\n");

  const telegram = await notifyTelegram(env, text);
  return Response.json({ ok: true, telegram });
}

async function listReviews(env: Env) {
  if (!env.DB) return Response.json({ ok: true, reviews: [] });

  const data = await env.DB
    .prepare("SELECT id, name, subject, score, text, created_at FROM reviews ORDER BY id DESC LIMIT 24")
    .all();

  return Response.json({ ok: true, reviews: data.results || [] });
}

async function createReview(request: Request, env: Env) {
  if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  const body = await request.json().catch(() => ({}));
  const name = clean((body as Record<string, unknown>).name, 80) || "Учень";
  const subject = clean((body as Record<string, unknown>).subject, 80);
  const score = clean((body as Record<string, unknown>).score, 40);
  const text = clean((body as Record<string, unknown>).text, 600);

  if (!text || text.length < 12) {
    return Response.json({ ok: false, error: "review_too_short" }, { status: 400 });
  }

  if (env.DB) {
    await env.DB
      .prepare("INSERT INTO reviews (name, subject, score, text, created_at) VALUES (?, ?, ?, ?, datetime('now'))")
      .bind(name, subject, score, text)
      .run();
  }

  await notifyTelegram(env, [
    "<b>Новий відгук NMTHub</b>",
    `Ім'я: ${escapeHtml(name)}`,
    `Предмет: ${escapeHtml(subject)}`,
    `Результат: ${escapeHtml(score)}`,
    `Текст: ${escapeHtml(text)}`,
  ].join("\n"));

  return Response.json({ ok: true });
}

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/lead") return sendLead(request, env);
    if (url.pathname === "/api/reviews" && request.method === "GET") return listReviews(env);
    if (url.pathname === "/api/reviews" && request.method === "POST") return createReview(request, env);
    return env.ASSETS.fetch(request);
  },
};
