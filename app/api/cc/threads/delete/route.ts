import { randomUUID } from "node:crypto";

import { CC_ORIGIN } from "@/lib/cc/cc-hosts";
import { forgetThreadsAccount } from "@/lib/cc/threads/forget-threads-account";

export async function POST(request: Request) {
  const userId = await forgetThreadsAccount(request);
  if (userId === undefined) return new Response("Bad request", { status: 400 });
  return Response.json({
    url: `${CC_ORIGIN}/login`,
    confirmation_code: randomUUID(),
  });
}
