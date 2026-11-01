import { CC_ORIGIN } from "@/lib/cc/cc-hosts";

export async function POST(request: Request) {
  const secret = process.env.CC_CRON_SECRET;
  if (
    secret === undefined ||
    request.headers.get("authorization") !== `Bearer ${secret}`
  ) {
    return new Response("Unauthorized", { status: 401 });
  }
  const response = await fetch(
    `https://api.telegram.org/bot${process.env.CC_TELEGRAM_BOT_TOKEN}/setWebhook`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: `${CC_ORIGIN}/api/cc/telegram`,
        secret_token: process.env.CC_TELEGRAM_WEBHOOK_SECRET,
        allowed_updates: ["message"],
      }),
    }
  );
  return Response.json(await response.json());
}
