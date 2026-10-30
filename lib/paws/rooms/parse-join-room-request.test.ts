import assert from "node:assert/strict";
import { test } from "node:test";

import { parseJoinRoomRequest } from "./parse-join-room-request";

test("reads a join request as watching unless it asks to play", () => {
  assert.deepEqual(parseJoinRoomRequest({ wantsToPlay: true }), {
    wantsToPlay: true,
  });
  assert.deepEqual(parseJoinRoomRequest({ wantsToPlay: "yes" }), {
    wantsToPlay: false,
  });
  assert.deepEqual(parseJoinRoomRequest(undefined), { wantsToPlay: false });
});

test("keeps a requested room only when it is a room id", () => {
  assert.deepEqual(
    parseJoinRoomRequest({ wantsToPlay: false, roomId: "r-1" }),
    {
      wantsToPlay: false,
      roomId: "r-1",
    }
  );
  assert.deepEqual(parseJoinRoomRequest({ roomId: "Room 1" }), {
    wantsToPlay: false,
  });
});
