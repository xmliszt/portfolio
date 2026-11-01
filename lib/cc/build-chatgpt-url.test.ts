import assert from "node:assert/strict";
import { test } from "node:test";

import { buildChatgptUrl } from "./build-chatgpt-url";

const PREFIX_LENGTH = "https://chatgpt.com/?q=".length;

test("prefills a short prompt", () => {
  assert.deepEqual(buildChatgptUrl({ prompt: "Hi there?" }), {
    kind: "prefilled",
    url: "https://chatgpt.com/?q=Hi%20there%3F",
  });
});

test("prefills a prompt whose URL is exactly 7,500 characters", () => {
  const result = buildChatgptUrl({ prompt: "a".repeat(7_500 - PREFIX_LENGTH) });
  assert.equal(result.kind, "prefilled");
  assert.equal(result.url.length, 7_500);
});

test("falls back to copy-then-open once the URL is longer than 7,500", () => {
  assert.deepEqual(
    buildChatgptUrl({ prompt: "a".repeat(7_501 - PREFIX_LENGTH) }),
    { kind: "copy-then-open", url: "https://chatgpt.com/" }
  );
  assert.equal(
    buildChatgptUrl({ prompt: "猫".repeat(1_000) }).kind,
    "copy-then-open"
  );
});
