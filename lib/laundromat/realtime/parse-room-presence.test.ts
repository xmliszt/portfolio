import assert from "node:assert/strict";
import { test } from "node:test";

import { parseRoomPresence } from "./parse-room-presence";

const now = Date.UTC(2026, 9, 11, 12);

test("reads a tracked presence and drops what it does not recognise", () => {
  assert.deepEqual(
    parseRoomPresence({
      value: {
        sessionId: "s",
        visitorId: "v",
        load: { kind: "dryer", startedAt: 1, durationMs: 300_000 },
        writingSince: now - 1000,
        presence_ref: "x",
      },
      now,
    }),
    {
      sessionId: "s",
      visitorId: "v",
      load: { kind: "dryer", startedAt: 1, durationMs: 300_000 },
      writingSince: now - 1000,
    }
  );
  assert.deepEqual(
    parseRoomPresence({
      value: { sessionId: "s", visitorId: "v", load: { kind: "oven" } },
      now,
    }),
    { sessionId: "s", visitorId: "v" }
  );
  assert.equal(
    parseRoomPresence({ value: { visitorId: "v" }, now }),
    undefined
  );
});

test("ignores a writing claim from the far past or the future", () => {
  for (const writingSince of [0, now - 31 * 60_000, now + 5 * 60_000]) {
    assert.equal(
      parseRoomPresence({
        value: { sessionId: "s", visitorId: "v", writingSince },
        now,
      })?.writingSince,
      undefined,
      `${writingSince}`
    );
  }
});
