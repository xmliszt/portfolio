import { runCampaignRules } from "@/lib/cc/data/run-campaign-rules";

export async function POST(request: Request) {
  const secret = process.env.CC_CRON_SECRET;
  if (
    secret === undefined ||
    request.headers.get("authorization") !== `Bearer ${secret}`
  ) {
    return new Response("Unauthorized", { status: 401 });
  }
  if (
    process.env.CC_TELEGRAM_BOT_TOKEN === undefined ||
    process.env.CC_TELEGRAM_CHAT_ID === undefined
  ) {
    return Response.json({ actions: [], skipped: "telegram not set up" });
  }
  return Response.json(await runCampaignRules({ now: new Date() }));
}
