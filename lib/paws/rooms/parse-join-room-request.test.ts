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
