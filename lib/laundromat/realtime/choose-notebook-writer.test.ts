import assert from "node:assert/strict";
import { test } from "node:test";

import { chooseNotebookWriter } from "./choose-notebook-writer";

function buildPresence(options: { sessionId: string; writingSince?: number }) {
  return { visitorId: "visitor", ...options };
}

test("the tab that started writing first holds the notebook", () => {
  assert.equal(
    chooseNotebookWriter({
      now: 100,
      presences: [
        buildPresence({ sessionId: "b", writingSince: 20 }),
        buildPresence({ sessionId: "a" }),
        buildPresence({ sessionId: "c", writingSince: 10 }),
      ],
    }),
    "c"
  );
});

test("a tie goes to the lower session id, and nobody writing frees the notebook", () => {
  assert.equal(
    chooseNotebookWriter({
      now: 100,
      presences: [
        buildPresence({ sessionId: "z", writingSince: 5 }),
        buildPresence({ sessionId: "y", writingSince: 5 }),
      ],
    }),
    "y"
  );
  assert.equal(
    chooseNotebookWriter({
      now: 100,
      presences: [buildPresence({ sessionId: "a" })],
    }),
    undefined
  );
});

test("a claim held past the writing limit no longer holds the notebook", () => {
  const now = 40 * 60_000;
  assert.equal(
    chooseNotebookWriter({
      now,
      presences: [
        buildPresence({ sessionId: "stale", writingSince: 0 }),
        buildPresence({ sessionId: "fresh", writingSince: now - 1000 }),
      ],
    }),
    "fresh"
  );
});
