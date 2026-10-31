import assert from "node:assert/strict";
import { test } from "node:test";

import { parseChatMessage } from "./parse-chat-message";

test("reads a chat line and keeps only its fields", () => {
  assert.deepEqual(
    parseChatMessage({ id: "m", userId: "u", text: "hi", extra: 1 }),
    { id: "m", userId: "u", text: "hi" }
  );
});

test("drops an empty, overlong or malformed line", () => {
  assert.equal(parseChatMessage({ id: "m", userId: "u", text: "" }), undefined);
  assert.equal(
    parseChatMessage({ id: "m", userId: "u", text: "a".repeat(61) }),
    undefined
  );
  assert.equal(parseChatMessage({ id: "m", text: "hi" }), undefined);
  assert.equal(parseChatMessage(undefined), undefined);
});
