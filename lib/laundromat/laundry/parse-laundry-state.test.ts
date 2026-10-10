import assert from "node:assert/strict";
import { test } from "node:test";

import type { LaundryState, MachineRef } from "./laundry-state";
import { parseLaundryState } from "./parse-laundry-state";

const running: LaundryState = {
  load: {
    kind: "running",
    machine: { id: "washer-1", kind: "washer", number: 1 },
    startedAt: 1_000,
    durationMs: 1_800_000,
    remind: true,
  },
  cycleMinutes: { "washer-1": 45 },
};

test("round-trips every load kind through JSON", () => {
  const machine: MachineRef = { id: "dryer-2", kind: "dryer", number: 2 };
  const states: LaundryState[] = [
    running,
    { load: { kind: "carrying", laundry: "wet" }, cycleMinutes: {} },
    { load: { kind: "folded" }, cycleMinutes: {} },
    { load: { kind: "loaded", machine }, cycleMinutes: {} },
    { load: { kind: "done", machine }, cycleMinutes: { "dryer-2": 15 } },
  ];
  for (const state of states) {
    assert.deepEqual(parseLaundryState(JSON.stringify(state)), state);
  }
});

test("rejects missing, malformed and unknown records", () => {
  const invalid = [
    null,
    "",
    "{",
    "[]",
    JSON.stringify({ load: { kind: "spinning" }, cycleMinutes: {} }),
    JSON.stringify({
      load: { kind: "carrying", laundry: "clean" },
      cycleMinutes: {},
    }),
    JSON.stringify({ load: { kind: "loaded" }, cycleMinutes: {} }),
    JSON.stringify({
      load: { ...running.load, startedAt: "soon" },
      cycleMinutes: {},
    }),
    JSON.stringify({ load: running.load }),
  ];
  for (const json of invalid) {
    assert.equal(parseLaundryState(json), undefined, String(json));
  }
});

test("drops dial settings that are not numbers", () => {
  const json = JSON.stringify({
    load: { kind: "folded" },
    cycleMinutes: { "washer-1": 45, "washer-2": "lots" },
  });
  assert.deepEqual(parseLaundryState(json)?.cycleMinutes, { "washer-1": 45 });
});
