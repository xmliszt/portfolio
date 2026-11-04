import { isCcOwnerEmail } from "@/lib/cc/auth/is-cc-owner-email";
import type { DeleteAccountResponse } from "@/lib/paws/account-api-types";
import { createPawsServiceClient } from "@/lib/paws/supabase/create-paws-service-client";
import { readRequestUser } from "@/lib/paws/supabase/read-request-user";

export const dynamic = "force-dynamic";

const PAWS_USER_TABLES = [
  "cats",
  "room_members",
  "room_joins",
  "chat_messages",
] as const;

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
  const { data, error: readError } = await client.auth.admin.getUserById(
    user.userId
  );
  if (readError !== null) return respond({ kind: "failed" }, 500);
  if (isCcOwnerEmail(data.user.email)) {
    const results = await Promise.all(
      PAWS_USER_TABLES.map((table) =>
        client.from(table).delete().eq("user_id", user.userId)
      )
    );
    if (results.some((result) => result.error !== null))
      return respond({ kind: "failed" }, 500);
    return respond({ kind: "deleted" }, 200);
  }
  const { error } = await client.auth.admin.deleteUser(user.userId);
  if (error !== null) return respond({ kind: "failed" }, 500);
  return respond({ kind: "deleted" }, 200);
}
