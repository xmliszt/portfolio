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
      load: {
        phase: "running",
        kind: "dryer",
        startedAt: 1,
        durationMs: 300_000,
      },
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

test("reads laundry sitting in a machine before and after its cycle", () => {
  for (const phase of ["loaded", "done"] as const) {
    assert.deepEqual(
      parseRoomPresence({
        value: {
          sessionId: "s",
          visitorId: "v",
          load: { phase, kind: "washer" },
        },
        now,
      })?.load,
      { phase, kind: "washer" }
    );
  }
  assert.equal(
    parseRoomPresence({
      value: {
        sessionId: "s",
        visitorId: "v",
        load: { phase: "running", kind: "washer" },
      },
      now,
    })?.load,
    undefined
  );
});

test("reads the machine a load is in, and drops one that is not a short string", () => {
  const read = (machineId: unknown) =>
    parseRoomPresence({
      value: {
        sessionId: "s",
        visitorId: "v",
        load: { phase: "loaded", kind: "washer", machineId },
      },
      now: Date.UTC(2026, 9, 11),
    })?.load;
  assert.deepEqual(read("washer-3"), {
    phase: "loaded",
    kind: "washer",
    machineId: "washer-3",
  });
  assert.deepEqual(read(7), { phase: "loaded", kind: "washer" });
  assert.deepEqual(read("x".repeat(41)), { phase: "loaded", kind: "washer" });
});

test("reads a coffee group and shared flask, and drops a flask changed too far ahead, brewing after it changed, or holding part of a cup", () => {
  const flask = {
    portions: 3,
    brewStartedAt: now - 5000,
    hotUntil: now + 60_000,
    brewedBy: "b",
    changedAt: now - 5000,
  };
  assert.deepEqual(
    parseRoomPresence({
      value: { sessionId: "s", visitorId: "v", coffeeGroupId: "g", flask },
      now,
    }),
    { sessionId: "s", visitorId: "v", coffeeGroupId: "g", flask }
  );
  assert.deepEqual(
    parseRoomPresence({
      value: {
        sessionId: "s",
        visitorId: "v",
        flask: { ...flask, brewStartedAt: now },
      },
      now,
    }),
    { sessionId: "s", visitorId: "v" }
  );
  assert.deepEqual(
    parseRoomPresence({
      value: {
        sessionId: "s",
        visitorId: "v",
        flask: { ...flask, changedAt: now + 600_000 },
      },
      now,
    }),
    { sessionId: "s", visitorId: "v" }
  );
  assert.deepEqual(
    parseRoomPresence({
      value: {
        sessionId: "s",
        visitorId: "v",
        flask: { ...flask, portions: 1.5 },
      },
      now,
    }),
    { sessionId: "s", visitorId: "v" }
  );
});

test("keeps a golden charge within its lifetime and drops one that ended or is malformed", () => {
  assert.deepEqual(
    parseRoomPresence({
      value: {
        sessionId: "s",
        visitorId: "v",
        goldenWash: { machineId: "washer-2", startedAt: now - 1000 },
      },
      now,
    }),
    {
      sessionId: "s",
      visitorId: "v",
      goldenWash: { machineId: "washer-2", startedAt: now - 1000 },
    }
  );
  for (const goldenWash of [
    { machineId: "washer-2", startedAt: now - 3 * 60 * 60_000 },
    { machineId: "washer-2", startedAt: now + 10 * 60_000 },
    { machineId: 2, startedAt: now },
  ]) {
    assert.deepEqual(
      parseRoomPresence({
        value: { sessionId: "s", visitorId: "v", goldenWash },
        now,
      }),
      { sessionId: "s", visitorId: "v" }
    );
  }
});
