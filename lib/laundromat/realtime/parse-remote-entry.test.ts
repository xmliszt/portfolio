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
        body: "hello",
        signOff: null,
        script: "latin",
        createdAt: "2026-10-11T10:00:00.000Z",
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
  ]) {
    assert.equal(
      parseRemoteEntry({ value: buildPayload({ entry }), maxChars: 50 }),
      undefined,
      JSON.stringify(entry)
    );
  }
});
