import assert from "node:assert/strict";
import { test } from "node:test";

import { parseRemoteDraft } from "./parse-remote-draft";

test("reads a draft and cuts its text to the notebook's limit", () => {
  assert.deepEqual(
    parseRemoteDraft({
      value: { sessionId: "s", text: "abcdef", script: "latin" },
      maxChars: 4,
    }),
    { sessionId: "s", text: "abcd", script: "latin" }
  );
  assert.equal(
    parseRemoteDraft({
      value: { sessionId: "s", text: "hi", script: "klingon" },
      maxChars: 4,
    }),
    undefined
  );
});

test("keeps the selection clamped to the cut text and drops a malformed one", () => {
  assert.deepEqual(
    parseRemoteDraft({
      value: {
        sessionId: "s",
        text: "abcdef",
        script: "latin",
        selection: { start: 9, end: 2 },
      },
      maxChars: 4,
    }),
    {
      sessionId: "s",
      text: "abcd",
      script: "latin",
      selection: { start: 2, end: 4 },
    }
  );
  assert.deepEqual(
    parseRemoteDraft({
      value: {
        sessionId: "s",
        text: "hi",
        script: "latin",
        selection: { start: "0", end: 1 },
      },
      maxChars: 4,
    }),
    { sessionId: "s", text: "hi", script: "latin" }
  );
});
