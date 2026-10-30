import assert from "node:assert/strict";
import { test } from "node:test";

import { parseRoomMemberRow } from "./parse-room-member-row";

test("reads a room member row", () => {
  assert.deepEqual(
    parseRoomMemberRow({
      room_id: "r",
      user_id: "u",
      role: "player",
      last_seen_at: "2026-10-30T12:00:00.000+00:00",
    }),
    {
      roomId: "r",
      userId: "u",
      role: "player",
      lastSeenAt: Date.parse("2026-10-30T12:00:00Z"),
    }
  );
  assert.equal(
    parseRoomMemberRow({
      room_id: "r",
      user_id: "u",
      role: "host",
      last_seen_at: "2026-10-30",
    }),
    undefined
  );
  assert.equal(
    parseRoomMemberRow({
      room_id: "r",
      user_id: "u",
      role: "player",
      last_seen_at: "soon",
    }),
    undefined
  );
});
