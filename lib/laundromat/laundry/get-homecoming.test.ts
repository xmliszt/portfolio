import assert from "node:assert/strict";
import { test } from "node:test";

import { getHomecoming } from "./get-homecoming";
import type { MachineRef } from "./laundry-state";

const washer: MachineRef = { id: "washer-1", kind: "washer", number: 1 };
const dryer: MachineRef = { id: "dryer-1", kind: "dryer", number: 1 };

test("brings dry laundry from the basket home as a clean pile", () => {
  assert.deepEqual(getHomecoming({ load: { kind: "folded" } }), {
    kind: "fresh",
  });
});

test("carries wet or unwashed laundry home in the basket", () => {
  assert.deepEqual(
    getHomecoming({ load: { kind: "carrying", laundry: "wet" } }),
    { kind: "carrying", laundry: "wet" }
  );
  assert.deepEqual(
    getHomecoming({ load: { kind: "carrying", laundry: "dirty" } }),
    { kind: "carrying", laundry: "dirty" }
  );
});

test("leaves finished laundry in its machine", () => {
  for (const machine of [washer, dryer]) {
    assert.deepEqual(getHomecoming({ load: { kind: "done", machine } }), {
      kind: "away",
    });
  }
});

test("leaves laundry in the machine while it is loaded or running", () => {
  assert.deepEqual(
    getHomecoming({ load: { kind: "loaded", machine: washer } }),
    { kind: "away" }
  );
  assert.deepEqual(
    getHomecoming({
      load: {
        kind: "running",
        machine: dryer,
        startedAt: 0,
        durationMs: 1,
        remind: false,
      },
    }),
    { kind: "away" }
  );
});
