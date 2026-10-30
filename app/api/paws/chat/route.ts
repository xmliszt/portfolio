import type { ChatResponse } from "@/lib/paws/chat/chat-api-types";
import { createChatDependencies } from "@/lib/paws/chat/create-chat-dependencies";
import { createChatPipeline } from "@/lib/paws/chat/create-chat-pipeline";
import { createPawsServiceClient } from "@/lib/paws/supabase/create-paws-service-client";
import { readRequestUser } from "@/lib/paws/supabase/read-request-user";

export const dynamic = "force-dynamic";

const STATUS = {
  sent: 200,
  tooFast: 429,
  notPlaying: 403,
  signInRequired: 401,
  invalid: 400,
  failed: 500,
} satisfies { [kind in ChatResponse["kind"]]: number };

export async function POST(request: Request) {
  const client = createPawsServiceClient();
  const user = await readRequestUser({ request, client });
  const body: unknown = await request.json().catch(() => undefined);
  const result = await createChatPipeline(
    createChatDependencies(client)
  ).sendChat({ user, body });
  return Response.json(result, {
    status: STATUS[result.kind],
    headers: { "Cache-Control": "no-store" },
  });
}
