import assert from "node:assert/strict";
import { test } from "node:test";

import { parseCallbackData } from "./parse-callback-data";

const POST_ID = "0c593729-01bf-45be-8a86-021b75df0d99";

test("reads a skip button", () => {
  assert.deepEqual(parseCallbackData(`skip:${POST_ID}`), {
    kind: "skip",
    postId: POST_ID,
  });
});

test("ignores other data", () => {
  assert.equal(parseCallbackData("skip:not-a-post"), undefined);
  assert.equal(parseCallbackData(`delete:${POST_ID}`), undefined);
  assert.equal(parseCallbackData(""), undefined);
});
