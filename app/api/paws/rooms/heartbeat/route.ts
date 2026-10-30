import { ROOM_LIMITS } from "@/lib/paws/room-limits";
import { parseRoomMemberRow } from "@/lib/paws/rooms/parse-room-member-row";
import { parseRoomRequest } from "@/lib/paws/rooms/parse-room-request";
import type { HeartbeatResponse } from "@/lib/paws/rooms/room-api-types";
import { ROOM_TIMING } from "@/lib/paws/rooms/room-timing";
import { shouldWatcherMove } from "@/lib/paws/rooms/should-watcher-move";
import { createPawsServiceClient } from "@/lib/paws/supabase/create-paws-service-client";
import { readRequestUser } from "@/lib/paws/supabase/read-request-user";

export const dynamic = "force-dynamic";

function respond(body: HeartbeatResponse, status: number) {
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
  const now = Date.now();
  const updated = await client
    .from("room_members")
    .update({ last_seen_at: new Date(now).toISOString() })
    .eq("room_id", body.roomId)
    .eq("user_id", user.userId)
    .gt("last_seen_at", new Date(now - ROOM_TIMING.memberFreshMs).toISOString())
    .select("role");
  if (updated.error !== null) return respond({ kind: "failed" }, 500);
  if (updated.data.length === 0) return respond({ kind: "gone" }, 200);
  if (updated.data.every((row: { role?: unknown }) => row.role !== "watcher"))
    return respond({ kind: "seen" }, 200);
  const rows = await client
    .from("room_members")
    .select("room_id, user_id, role, last_seen_at");
  if (rows.error !== null) return respond({ kind: "seen" }, 200);
  const isMoving = shouldWatcherMove({
    members: rows.data.flatMap((row: unknown) => {
      const member = parseRoomMemberRow(row);
      return member === undefined ? [] : [member];
    }),
    userId: user.userId,
    roomId: body.roomId,
    now,
    freshMs: ROOM_TIMING.memberFreshMs,
    maxWatchers: ROOM_LIMITS.maxWatchers,
  });
  return respond({ kind: isMoving ? "move" : "seen" }, 200);
}
