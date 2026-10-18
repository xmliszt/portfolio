import assert from "node:assert/strict";
import { test } from "node:test";

import { parseRemoteEntry } from "./parse-remote-entry";

function buildPayload(options: { entry: { [key: string]: unknown } }) {
  return {
    sessionId: "s",
    notebookNumber: 2,
    entry: {
      id: 7,
      page: 3,
      lineStart: 5,
      lineCount: 2,
      body: "hello there",
      signOff: null,
      script: "latin",
      createdAt: "2026-10-11T10:00:00.000Z",
      ...options.entry,
    },
  };
}

test("reads a saved entry and cuts its body to the notebook's limit", () => {
  assert.deepEqual(
    parseRemoteEntry({ value: buildPayload({ entry: {} }), maxChars: 5 }),
    {
      sessionId: "s",
      notebookNumber: 2,
      entry: {
        id: 7,
        page: 3,
        lineStart: 5,
        lineCount: 2,
        signOff: null,
        script: "latin",
        createdAt: "2026-10-11T10:00:00.000Z",
        kind: "text",
        body: "hello",
      },
    }
  );
});

test("rejects an entry with a bad field", () => {
  for (const entry of [
    { page: 0 },
    { lineCount: 1.5 },
    { script: "klingon" },
    { createdAt: "yesterday" },
    { signOff: 3 },
    { body: 4 },
  ]) {
    assert.equal(
      parseRemoteEntry({ value: buildPayload({ entry }), maxChars: 50 }),
      undefined,
      JSON.stringify(entry)
    );
  }
});

test("masks swear words in the body and sign-off another tab sent", () => {
  const parsed = parseRemoteEntry({
    value: buildPayload({
      entry: { body: "what the fuck", signOff: "shit happens" },
    }),
    maxChars: 100,
  });
  assert.equal(
    parsed?.entry.kind === "text" ? parsed.entry.body : undefined,
    "what the ****"
  );
  assert.equal(parsed?.entry.signOff, "**** happens");
});

test("reads a saved doodle with its drawing", () => {
  const drawing = { w: 396, strokes: [[80, 10, 10, 4, 2]] };
  const parsed = parseRemoteEntry({
    value: buildPayload({ entry: { kind: "doodle", body: "", drawing } }),
    maxChars: 50,
  });
  assert.equal(parsed?.entry.kind, "doodle");
  assert.deepEqual(
    parsed?.entry.kind === "doodle" ? parsed.entry.drawing : undefined,
    drawing
  );
});
