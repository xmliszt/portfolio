import assert from "node:assert/strict";
import { test } from "node:test";

import { parseChatRequest } from "./parse-chat-request";

const LINE_ID = "0f8fad5b-d9cb-469f-a165-70867728950e";

test("reads a room and normalized text", () => {
  assert.deepEqual(
    parseChatRequest({
      roomId: "r-1",
      lineId: LINE_ID,
      text: "  hello   cat ",
    }),
    { roomId: "r-1", lineId: LINE_ID, text: "hello cat" }
  );
});

test("drops a bad room or line id, a missing text or a blank one", () => {
  assert.equal(
    parseChatRequest({ roomId: "R 1", lineId: LINE_ID, text: "hi" }),
    undefined
  );
  assert.equal(
    parseChatRequest({ roomId: "r", lineId: "x", text: "hi" }),
    undefined
  );
  assert.equal(parseChatRequest({ roomId: "r", text: "hi" }), undefined);
  assert.equal(parseChatRequest({ roomId: "r", lineId: LINE_ID }), undefined);
  assert.equal(
    parseChatRequest({ roomId: "r", lineId: LINE_ID, text: "   " }),
    undefined
  );
  assert.equal(parseChatRequest("hi"), undefined);
});
