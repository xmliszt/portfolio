import assert from "node:assert/strict";
import { test } from "node:test";

import { getUnloadedVisitorIds } from "./get-unloaded-visitor-ids";
import type { RemoteLoad } from "./room-presence";

const DONE_WASHER: RemoteLoad = {
  phase: "done",
  kind: "washer",
  machineId: "washer-1",
};

test("a visitor who stays but no longer has laundry has unloaded", () => {
  assert.deepEqual(
    getUnloadedVisitorIds({
      previous: [{ visitorId: "a", load: DONE_WASHER }],
      current: [{ visitorId: "a" }],
      ownVisitorId: "me",
    }),
    ["a"]
  );
});

test("taking a done load out and loading the next machine in one update is an unload", () => {
  assert.deepEqual(
    getUnloadedVisitorIds({
      previous: [{ visitorId: "a", load: DONE_WASHER }],
      current: [
        {
          visitorId: "a",
          load: { phase: "loaded", kind: "dryer", machineId: "dryer-1" },
        },
      ],
      ownVisitorId: "me",
    }),
    ["a"]
  );
});

test("a load that goes from running to taken out, its done update never sent, is an unload", () => {
  assert.deepEqual(
    getUnloadedVisitorIds({
      previous: [
        {
          visitorId: "a",
          load: {
            phase: "running",
            kind: "washer",
            machineId: "washer-1",
            startedAt: 0,
            durationMs: 1000,
          },
        },
      ],
      current: [{ visitorId: "a" }],
      ownVisitorId: "me",
    }),
    ["a"]
  );
});

test("taking back laundry that never ran is not an unload", () => {
  assert.deepEqual(
    getUnloadedVisitorIds({
      previous: [
        {
          visitorId: "a",
          load: { phase: "loaded", kind: "washer", machineId: "washer-1" },
        },
      ],
      current: [{ visitorId: "a" }],
      ownVisitorId: "me",
    }),
    []
  );
});

test("a visitor who leaves with laundry still in a machine has not unloaded", () => {
  assert.deepEqual(
    getUnloadedVisitorIds({
      previous: [{ visitorId: "a", load: DONE_WASHER }],
      current: [],
      ownVisitorId: "me",
    }),
    []
  );
});

test("a visitor counts once across tabs, and only once every tab has no laundry", () => {
  assert.deepEqual(
    getUnloadedVisitorIds({
      previous: [
        { visitorId: "a", load: DONE_WASHER },
        { visitorId: "a", load: DONE_WASHER },
      ],
      current: [{ visitorId: "a" }, { visitorId: "a", load: DONE_WASHER }],
      ownVisitorId: "me",
    }),
    []
  );
  assert.deepEqual(
    getUnloadedVisitorIds({
      previous: [
        { visitorId: "a", load: DONE_WASHER },
        { visitorId: "a", load: DONE_WASHER },
      ],
      current: [{ visitorId: "a" }, { visitorId: "a" }],
      ownVisitorId: "me",
    }),
    ["a"]
  );
});

test("the visitor's own unload is left out", () => {
  assert.deepEqual(
    getUnloadedVisitorIds({
      previous: [{ visitorId: "me", load: DONE_WASHER }],
      current: [{ visitorId: "me" }],
      ownVisitorId: "me",
    }),
    []
  );
});
