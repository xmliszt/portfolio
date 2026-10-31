import { parseRoomMemberRow } from "@/lib/paws/rooms/parse-room-member-row";
import type { ListRoomsResponse } from "@/lib/paws/rooms/room-api-types";
import { ROOM_TIMING } from "@/lib/paws/rooms/room-timing";
import { summarizeRooms } from "@/lib/paws/rooms/summarize-rooms";
import { createPawsServiceClient } from "@/lib/paws/supabase/create-paws-service-client";
import { readRequestUser } from "@/lib/paws/supabase/read-request-user";

export const dynamic = "force-dynamic";

function respond(body: ListRoomsResponse, status: number) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  const client = createPawsServiceClient();
  const user = await readRequestUser({ request, client });
  if (user === undefined) return respond({ kind: "forbidden" }, 401);
  const rows = await client
    .from("room_members")
    .select("room_id, user_id, role, last_seen_at");
  if (rows.error !== null) return respond({ kind: "failed" }, 500);
  return respond(
    {
      kind: "rooms",
      rooms: summarizeRooms({
        members: rows.data.flatMap((row: unknown) => {
          const member = parseRoomMemberRow(row);
          return member === undefined ? [] : [member];
        }),
        now: Date.now(),
        freshMs: ROOM_TIMING.memberFreshMs,
      }),
    },
    200
  );
}
