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

type SubscriberRow = { chat_id: string };

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

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function getRawChatIds(env: Env) {
  return (env.TELEGRAM_CHAT_IDS || env.TELEGRAM_CHAT_ID || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

function getValidChatIds(values: string[]) {
  return values.filter((id) => /^-?\d+$/.test(id));
}

async function getSubscriberChatIds(env: Env) {
  if (!env.DB) return [];

  const data = await env.DB
    .prepare("SELECT chat_id FROM telegram_subscribers ORDER BY last_seen_at DESC LIMIT 1000")
    .all<SubscriberRow>();

  return (data.results || []).map((row) => clean(row.chat_id, 40));
}

async function sendTelegramToIds(env: Env, chatIdsInput: string[], text: string) {
  const token = clean(env.TELEGRAM_BOT_TOKEN, 220);
  const rawChatIds = unique(chatIdsInput);
  const chatIds = getValidChatIds(rawChatIds);

  if (!token || !token.includes(":")) {
    return { ok: false, delivered: 0, failed: 0, error: "telegram_bot_token_missing_or_invalid" };
  }

  if (rawChatIds.length === 0) {
    return { ok: false, delivered: 0, failed: 0, error: "telegram_chat_id_missing" };
  }

  if (chatIds.length === 0) {
    return { ok: false, delivered: 0, failed: rawChatIds.length, error: "telegram_chat_id_must_be_number" };
  }

  const results = await Promise.allSettled(
    chatIds.map(async (chatId) => {
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true }),
      });
      const data = await response.json().catch(() => ({}));
      return { ok: response.ok, data, chatId };
    }),
  );

  const delivered = results.filter((result) => result.status === "fulfilled" && result.value.ok).length;
  const failed = results.length - delivered;
  const details = results.map((result) => result.status === "fulfilled" ? result.value : { ok: false, error: "request_failed" });
  return { ok: delivered > 0, delivered, failed, error: delivered > 0 ? null : "telegram_send_failed", details };
}

async function notifyTelegram(env: Env, text: string) {
  const fixedChatIds = getRawChatIds(env);
  const subscriberChatIds = await getSubscriberChatIds(env).catch(() => []);
  return sendTelegramToIds(env, [...fixedChatIds, ...subscriberChatIds], text);
}

async function telegramTest(env: Env) {
  const fixedChatIds = getRawChatIds(env);
  const subscriberChatIds = await getSubscriberChatIds(env).catch(() => []);
  const result = await sendTelegramToIds(env, [...fixedChatIds, ...subscriberChatIds], [
    "<b>NMTHub test</b>",
    "Якщо ви бачите це повідомлення — Telegram підключений правильно.",
  ].join("\n"));

  return Response.json({
    ok: result.ok,
    tokenVisibleToWorker: Boolean(env.TELEGRAM_BOT_TOKEN),
    fixedChatIdsCount: fixedChatIds.length,
    subscriberChatIdsCount: subscriberChatIds.length,
    result,
  }, { headers: { "Cache-Control": "no-store" } });
}

async function sendLead(request: Request, env: Env) {
  if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  const body = await request.json().catch(() => ({}));
  const source = body as Record<string, unknown>;
  const name = clean(source.name, 80) || "Не вказано";
  const phone = clean(source.phone, 80) || "Не вказано";
  const subject = clean(source.subject, 80) || "Не вказано";
  const score = clean(source.score, 40) || "Не вказано";
  const type = clean(source.type || "Заявка", 60);
  const courseTitle = clean(source.courseTitle, 100);
  const coursePrice = clean(source.coursePrice, 60);
  const correct = clean(source.correct, 20);
  const wrong = clean(source.wrong, 20);

  const lines = [
    `<b>${escapeHtml(type)} NMTHub</b>`,
    `Ім'я: ${escapeHtml(name)}`,
    `Телефон: ${escapeHtml(phone)}`,
    `Предмет: ${escapeHtml(subject)}`,
  ];

  if (courseTitle) lines.push(`Пакет: ${escapeHtml(courseTitle)}`);
  if (coursePrice) lines.push(`Ціна: ${escapeHtml(coursePrice)}`);
  lines.push(`Результат тесту: ${escapeHtml(score)}`);
  if (correct || wrong) lines.push(`Статистика: правильно ${escapeHtml(correct || "0")}, неправильно ${escapeHtml(wrong || "0")}`);

  const telegram = await notifyTelegram(env, lines.join("\n"));
  return Response.json({ ok: true, telegram });
}

async function handleTelegramWebhook(request: Request, env: Env) {
  if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  const update = await request.json().catch(() => null) as Record<string, any> | null;
  const message = update?.message || update?.edited_message;
  const chat = message?.chat;
  const from = message?.from || {};
  const text = clean(message?.text, 500);
  const chatId = clean(chat?.id, 40);

  if (!chatId) return Response.json({ ok: true, skipped: true });

  if (env.DB) {
    await env.DB
      .prepare("INSERT INTO telegram_subscribers (chat_id, username, first_name, last_name, created_at, last_seen_at) VALUES (?, ?, ?, ?, datetime('now'), datetime('now')) ON CONFLICT(chat_id) DO UPDATE SET username = excluded.username, first_name = excluded.first_name, last_name = excluded.last_name, last_seen_at = datetime('now')")
      .bind(chatId, clean(from.username, 80), clean(from.first_name, 80), clean(from.last_name, 80))
      .run()
      .catch(() => undefined);
  }

  if (text.startsWith("/start")) {
    await sendTelegramToIds(env, [chatId], [
      "<b>NMTHub</b>",
      "Ви підключені до сповіщень.",
      "Тепер сюди приходитимуть заявки з сайту.",
      "Сайт: https://add.nmthub.online/",
    ].join("\n"));
  }

  return Response.json({ ok: true });
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
    if (url.pathname === "/api/telegram-test") return telegramTest(env);
    if (url.pathname === "/api/telegram") return handleTelegramWebhook(request, env);
    if (url.pathname === "/api/reviews" && request.method === "GET") return listReviews(env);
    if (url.pathname === "/api/reviews" && request.method === "POST") return createReview(request, env);
    return env.ASSETS.fetch(request);
  },
};
