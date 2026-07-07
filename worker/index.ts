type Env = {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
};

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function sendLead(request: Request, env: Env) {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
    return Response.json({ ok: false, error: "telegram_env_missing" }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const text = [
    "<b>Нова заявка NMTHub</b>",
    `Ім'я: ${escapeHtml(body.name)}`,
    `Телефон: ${escapeHtml(body.phone)}`,
    `Предмет: ${escapeHtml(body.subject)}`,
    `Міні-тест: ${escapeHtml(body.score)}`,
  ].join("\n");

  const telegramResponse = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text, parse_mode: "HTML" }),
  });

  if (!telegramResponse.ok) {
    return Response.json({ ok: false, error: "telegram_send_failed" }, { status: 502 });
  }

  return Response.json({ ok: true });
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
