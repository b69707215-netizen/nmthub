type Env = {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
  TELEGRAM_CHAT_IDS?: string;
};

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function getChatIds(env: Env) {
  return (env.TELEGRAM_CHAT_IDS || env.TELEGRAM_CHAT_ID || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

async function sendLead(request: Request, env: Env) {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const chatIds = getChatIds(env);
  if (!env.TELEGRAM_BOT_TOKEN || chatIds.length === 0) {
    return Response.json({ ok: false, error: "telegram_env_missing" }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const text = [
    "<b>Нова заявка NMTHub</b>",
    `Ім'я: ${escapeHtml(body.name)}`,
    `Телефон: ${escapeHtml(body.phone)}`,
    `Предмет: ${escapeHtml(body.subject)}`,
    `Тест: ${escapeHtml(body.score)}`,
  ].join("\n");

  const results = await Promise.allSettled(
    chatIds.map((chatId) =>
      fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
      }),
    ),
  );

  const delivered = results.filter((result) => result.status === "fulfilled" && result.value.ok).length;
  if (delivered === 0) {
    return Response.json({ ok: false, error: "telegram_send_failed" }, { status: 502 });
  }

  return Response.json({ ok: true, delivered });
}

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/lead") {
      return sendLead(request, env);
    }
    return env.ASSETS.fetch(request);
  },
};
