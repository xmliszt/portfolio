import type { DeleteAccountResponse } from "@/lib/paws/account-api-types";
import { createPawsServiceClient } from "@/lib/paws/supabase/create-paws-service-client";
import { readRequestUser } from "@/lib/paws/supabase/read-request-user";

export const dynamic = "force-dynamic";

function respond(body: DeleteAccountResponse, status: number) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function DELETE(request: Request) {
  const client = createPawsServiceClient();
  const user = await readRequestUser({ request, client });
  if (user === undefined || user.isAnonymous)
    return respond({ kind: "signInRequired" }, 401);
  const { error } = await client.auth.admin.deleteUser(user.userId);
  if (error !== null) return respond({ kind: "failed" }, 500);
  return respond({ kind: "deleted" }, 200);
}
