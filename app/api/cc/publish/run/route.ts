import { publishDuePosts } from "@/lib/cc/data/publish-due-posts";

export const maxDuration = 300;

export async function POST(request: Request) {
  const secret = process.env.CC_CRON_SECRET;
  if (
    secret === undefined ||
    request.headers.get("authorization") !== `Bearer ${secret}`
  ) {
    return new Response("Unauthorized", { status: 401 });
  }
  return Response.json(await publishDuePosts({ now: new Date() }));
}
