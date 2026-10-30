import { ROOM_LIMITS } from "@/lib/paws/room-limits";
import type { RoomRole } from "@/lib/paws/room-source";
import { getRoomTopic } from "@/lib/paws/rooms/get-room-topic";
import { parseJoinRoomRequest } from "@/lib/paws/rooms/parse-join-room-request";
import { parseRoomMemberRow } from "@/lib/paws/rooms/parse-room-member-row";
import { pickRoom } from "@/lib/paws/rooms/pick-room";
import type { JoinRoomResponse } from "@/lib/paws/rooms/room-api-types";
import { ROOM_TIMING } from "@/lib/paws/rooms/room-timing";
import { createPawsServiceClient } from "@/lib/paws/supabase/create-paws-service-client";
import { readRequestUser } from "@/lib/paws/supabase/read-request-user";

export const dynamic = "force-dynamic";

function respond(body: JoinRoomResponse, status: number) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  const client = createPawsServiceClient();
  const user = await readRequestUser({ request, client });
  if (user === undefined) return respond({ kind: "forbidden" }, 401);
  const { wantsToPlay } = parseJoinRoomRequest(
    await request.json().catch(() => undefined)
  );
  const role: RoomRole =
    wantsToPlay && !user.isAnonymous ? "player" : "watcher";
  const now = Date.now();
  const joinWindowStart = new Date(
    now - ROOM_TIMING.joinWindowMs
  ).toISOString();

  await client
    .from("room_joins")
    .delete()
    .eq("user_id", user.userId)
    .lt("created_at", joinWindowStart);
  const joins = await client
    .from("room_joins")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.userId);
  if (joins.error !== null) return respond({ kind: "failed" }, 500);
  if ((joins.count ?? 0) >= ROOM_TIMING.maxJoinsPerWindow)
    return respond({ kind: "tooManyJoins" }, 429);
  const recorded = await client
    .from("room_joins")
    .insert({ user_id: user.userId });
  if (recorded.error !== null) return respond({ kind: "failed" }, 500);

  const freshCutoff = new Date(now - ROOM_TIMING.memberFreshMs).toISOString();
  await client.from("room_members").delete().lt("last_seen_at", freshCutoff);
  const rows = await client
    .from("room_members")
    .select("room_id, user_id, role, last_seen_at");
  if (rows.error !== null) return respond({ kind: "failed" }, 500);
  const picked = pickRoom({
    members: rows.data.flatMap((row: unknown) => {
      const member = parseRoomMemberRow(row);
      return member === undefined ? [] : [member];
    }),
    userId: user.userId,
    role,
    now,
    freshMs: ROOM_TIMING.memberFreshMs,
    limits: ROOM_LIMITS,
    createRoomId: () => crypto.randomUUID(),
  });
  if (picked.kind === "full") return respond({ kind: "full" }, 200);

  const left = await client
    .from("room_members")
    .delete()
    .eq("user_id", user.userId)
    .neq("room_id", picked.roomId);
  if (left.error !== null) return respond({ kind: "failed" }, 500);
  const joined = await client
    .from("room_members")
    .upsert(
      {
        room_id: picked.roomId,
        user_id: user.userId,
        role,
        last_seen_at: new Date(now).toISOString(),
      },
      { onConflict: "room_id,user_id" }
    );
  if (joined.error !== null) return respond({ kind: "failed" }, 500);
  return respond(
    {
      kind: "joined",
      roomId: picked.roomId,
      topic: getRoomTopic(picked.roomId),
      role,
    },
    200
  );
}
