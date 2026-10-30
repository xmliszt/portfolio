import assert from "node:assert/strict";
import { test } from "node:test";

import { parseChatResponse } from "./parse-chat-response";

test("reads a sent line and each plain answer", () => {
  assert.deepEqual(
    parseChatResponse({
      kind: "sent",
      message: { id: "m", userId: "u", text: "hi" },
    }),
    { kind: "sent", message: { id: "m", userId: "u", text: "hi" } }
  );
  assert.deepEqual(parseChatResponse({ kind: "tooFast" }), { kind: "tooFast" });
});

test("drops an unknown answer or a sent one without a line", () => {
  assert.equal(parseChatResponse({ kind: "sure" }), undefined);
  assert.equal(parseChatResponse({ kind: "sent" }), undefined);
  assert.equal(parseChatResponse(undefined), undefined);
});
