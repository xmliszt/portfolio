import { forgetThreadsAccount } from "@/lib/cc/threads/forget-threads-account";

export async function POST(request: Request) {
  const userId = await forgetThreadsAccount(request);
  if (userId === undefined) return new Response("Bad request", { status: 400 });
  return Response.json({ ok: true });
}
