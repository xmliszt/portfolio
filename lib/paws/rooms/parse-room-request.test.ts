import assert from "node:assert/strict";
import { test } from "node:test";

import { parseRoomRequest } from "./parse-room-request";

test("reads a room id made of lowercase letters, digits and dashes", () => {
  assert.deepEqual(parseRoomRequest({ roomId: "3f2a-9c" }), {
    roomId: "3f2a-9c",
  });
  assert.equal(parseRoomRequest({ roomId: "a:b" }), undefined);
  assert.equal(parseRoomRequest({ roomId: "" }), undefined);
  assert.equal(parseRoomRequest({ roomId: "a".repeat(65) }), undefined);
  assert.equal(parseRoomRequest(undefined), undefined);
});
