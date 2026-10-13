import assert from "node:assert/strict";
import { test } from "node:test";

import { MAX_CLOCK_OFFSET_MS, mergeClockOffset } from "./merge-clock-offset";

const clock = { sessionId: "s", visitorId: "v", sentAt: 1_000 };

test("records local time minus the sender's time", () => {
  assert.deepEqual(
    mergeClockOffset({ offsetsMs: {}, clock, receivedAt: 51_000 }),
    { v: 50_000 }
  );
});

test("keeps the smallest sample, since delivery delay only adds to it", () => {
  const offsetsMs = { v: 50_000 };
  assert.equal(
    mergeClockOffset({ offsetsMs, clock, receivedAt: 51_200 }),
    offsetsMs
  );
  assert.deepEqual(mergeClockOffset({ offsetsMs, clock, receivedAt: 50_900 }), {
    v: 49_900,
  });
});

test("records a sender whose clock runs ahead as a negative offset", () => {
  assert.deepEqual(
    mergeClockOffset({ offsetsMs: {}, clock, receivedAt: -29_000 }),
    { v: -30_000 }
  );
});

test("ignores a sample beyond the offset limit", () => {
  const offsetsMs = {};
  assert.equal(
    mergeClockOffset({
      offsetsMs,
      clock,
      receivedAt: clock.sentAt + MAX_CLOCK_OFFSET_MS + 1,
    }),
    offsetsMs
  );
});
