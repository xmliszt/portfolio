import assert from "node:assert/strict";
import { test } from "node:test";

import { parseRemoteDraft } from "./parse-remote-draft";

test("reads a draft and cuts its text to the notebook's limit", () => {
  assert.deepEqual(
    parseRemoteDraft({
      value: { sessionId: "s", text: "abcdef", script: "latin" },
      maxChars: 4,
    }),
    { sessionId: "s", kind: "text", text: "abcd", script: "latin" }
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
      kind: "text",
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
    { sessionId: "s", kind: "text", text: "hi", script: "latin" }
  );
});

test("masks swear words in a draft and keeps its selection", () => {
  assert.deepEqual(
    parseRemoteDraft({
      value: {
        sessionId: "s",
        text: "what the fuck",
        script: "latin",
        selection: { start: 13, end: 13 },
      },
      maxChars: 100,
    }),
    {
      sessionId: "s",
      kind: "text",
      text: "what the ****",
      script: "latin",
      selection: { start: 13, end: 13 },
    }
  );
});

test("reads a doodle draft and drops a malformed drawing", () => {
  const drawing = { w: 396, strokes: [[80, 10, 10, 4, 2]] };
  assert.deepEqual(
    parseRemoteDraft({
      value: { sessionId: "s", kind: "doodle", drawing },
      maxChars: 4,
    }),
    { sessionId: "s", kind: "doodle", drawing }
  );
  assert.deepEqual(
    parseRemoteDraft({
      value: { sessionId: "s", kind: "doodle", drawing: { w: 396 } },
      maxChars: 4,
    }),
    { sessionId: "s", kind: "doodle", drawing: undefined }
  );
});
