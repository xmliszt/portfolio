import { parseRoomRequest } from "@/lib/paws/rooms/parse-room-request";
import type { LeaveRoomResponse } from "@/lib/paws/rooms/room-api-types";
import { createPawsServiceClient } from "@/lib/paws/supabase/create-paws-service-client";
import { readRequestUser } from "@/lib/paws/supabase/read-request-user";

export const dynamic = "force-dynamic";

function respond(body: LeaveRoomResponse, status: number) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  const client = createPawsServiceClient();
  const user = await readRequestUser({ request, client });
  if (user === undefined) return respond({ kind: "forbidden" }, 401);
  const body = parseRoomRequest(await request.json().catch(() => undefined));
  if (body === undefined) return respond({ kind: "failed" }, 400);
  const deleted = await client
    .from("room_members")
    .delete()
    .eq("room_id", body.roomId)
    .eq("user_id", user.userId);
  if (deleted.error !== null) return respond({ kind: "failed" }, 500);
  return respond({ kind: "left" }, 200);
}
