import assert from "node:assert/strict";
import { test } from "node:test";

import { parseChatRequest } from "./parse-chat-request";

test("reads a room and normalized text", () => {
  assert.deepEqual(
    parseChatRequest({ roomId: "r-1", text: "  hello   cat " }),
    {
      roomId: "r-1",
      text: "hello cat",
    }
  );
});

test("drops a bad room id, a missing text or a blank one", () => {
  assert.equal(parseChatRequest({ roomId: "R 1", text: "hi" }), undefined);
  assert.equal(parseChatRequest({ roomId: "r" }), undefined);
  assert.equal(parseChatRequest({ roomId: "r", text: "   " }), undefined);
  assert.equal(parseChatRequest("hi"), undefined);
});
