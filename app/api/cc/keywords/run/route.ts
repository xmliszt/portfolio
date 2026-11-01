import { runKeywordCounts } from "@/lib/cc/x/run-keyword-counts";

export async function POST(request: Request) {
  const secret = process.env.CC_CRON_SECRET;
  if (
    secret === undefined ||
    request.headers.get("authorization") !== `Bearer ${secret}`
  ) {
    return new Response("Unauthorized", { status: 401 });
  }
  const bearerToken = process.env.CC_X_BEARER_TOKEN;
  if (!bearerToken) {
    return Response.json({ saved: [], skipped: "x not set up" });
  }
  return Response.json(
    await runKeywordCounts({ bearerToken, now: new Date() })
  );
}
