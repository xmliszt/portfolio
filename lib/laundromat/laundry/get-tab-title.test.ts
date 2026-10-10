import assert from "node:assert/strict";
import { test } from "node:test";

import { getTabTitle } from "./get-tab-title";
import type { LaundryState, MachineRef } from "./laundry-state";
import { INITIAL_LAUNDRY_STATE } from "./laundry-state";

const machine: MachineRef = { id: "washer-1", kind: "washer", number: 1 };

test("reads Laundromat when no cycle runs", () => {
  assert.equal(
    getTabTitle({ state: INITIAL_LAUNDRY_STATE, now: 0 }),
    "Laundromat"
  );
  assert.equal(
    getTabTitle({
      state: { load: { kind: "loaded", machine }, cycleMinutes: {} },
      now: 0,
    }),
    "Laundromat"
  );
});

test("shows the remaining time while a cycle runs", () => {
  const state: LaundryState = {
    load: {
      kind: "running",
      machine,
      startedAt: 0,
      durationMs: 30 * 60_000,
      remind: false,
    },
    cycleMinutes: {},
  };
  assert.equal(getTabTitle({ state, now: 0 }), "30:00 · Laundromat");
  assert.equal(getTabTitle({ state, now: 678_000 }), "18:42 · Laundromat");
  assert.equal(
    getTabTitle({ state, now: 30 * 60_000 - 1 }),
    "00:01 · Laundromat"
  );
});

test("says done once the cycle ends", () => {
  assert.equal(
    getTabTitle({
      state: { load: { kind: "done", machine }, cycleMinutes: {} },
      now: 0,
    }),
    "done · Laundromat"
  );
});
