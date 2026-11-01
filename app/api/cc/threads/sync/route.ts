import { getThreadsApp } from "@/lib/cc/threads/get-threads-app";
import { syncThreadsMetrics } from "@/lib/cc/threads/sync-threads-metrics";

export async function POST(request: Request) {
  const secret = process.env.CC_CRON_SECRET;
  if (
    secret === undefined ||
    request.headers.get("authorization") !== `Bearer ${secret}`
  ) {
    return new Response("Unauthorized", { status: 401 });
  }
  if (getThreadsApp() === undefined) {
    return Response.json({ saved: [], skipped: "threads not set up" });
  }
  return Response.json(await syncThreadsMetrics({ now: new Date() }));
}
