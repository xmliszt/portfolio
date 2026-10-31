import assert from "node:assert/strict";
import { test } from "node:test";

import { normalizeChatText } from "./normalize-chat-text";

test("trims, collapses whitespace and drops control characters", () => {
  assert.equal(
    normalizeChatText("  hi\u0007   there\n\n friend "),
    "hi there friend"
  );
});

test("cuts to the chat length by characters, not code units", () => {
  const text = normalizeChatText("😺".repeat(80));
  assert.equal(Array.from(text).length, 60);
});
