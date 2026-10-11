import assert from "node:assert/strict";
import { test } from "node:test";

import type {
  LaundryEvent,
  LaundryLoad,
  LaundryState,
  MachineCycles,
  MachineRef,
} from "./laundry-state";
import { INITIAL_LAUNDRY_STATE } from "./laundry-state";
import { transitionLaundry } from "./transition-laundry";

const washer: MachineRef = { id: "washer-2", kind: "washer", number: 2 };
const otherWasher: MachineRef = { id: "washer-3", kind: "washer", number: 3 };
const dryer: MachineRef = { id: "dryer-1", kind: "dryer", number: 1 };
const startedAt = Date.UTC(2026, 0, 1, 0, 54);
const machines: MachineCycles = {
  cycleMinutes: [5, 10, 15, 20, 25, 30, 45, 60],
  defaultWasherCycleMinutes: 30,
  defaultDryerCycleMinutes: 10,
};

function buildState(options: {
  load: LaundryLoad;
  cycleMinutes?: { [machineId: string]: number };
}): LaundryState {
  return { load: options.load, cycleMinutes: options.cycleMinutes ?? {} };
}

function buildRunning(options: { machine: MachineRef; remind?: boolean }) {
  return buildState({
    load: {
      kind: "running",
      machine: options.machine,
      startedAt,
      durationMs: 30 * 60_000,
      remind: options.remind ?? false,
    },
  });
}

function transition(options: { state: LaundryState; event: LaundryEvent }) {
  return transitionLaundry({ ...options, machines });
}

test("starts carrying dirty laundry with every dial at its default", () => {
  assert.deepEqual(INITIAL_LAUNDRY_STATE, {
    load: { kind: "carrying", laundry: "dirty" },
    cycleMinutes: {},
  });
});

test("open-door loads dirty laundry into a washer", () => {
  const next = transition({
    state: INITIAL_LAUNDRY_STATE,
    event: { type: "open-door", machine: washer },
  });
  assert.deepEqual(next.load, { kind: "loaded", machine: washer });
});

test("open-door does nothing at a dryer while carrying dirty laundry", () => {
  const next = transition({
    state: INITIAL_LAUNDRY_STATE,
    event: { type: "open-door", machine: dryer },
  });
  assert.equal(next, INITIAL_LAUNDRY_STATE);
});

test("open-door loads wet laundry into a dryer", () => {
  const state = buildState({ load: { kind: "carrying", laundry: "wet" } });
  const next = transition({
    state,
    event: { type: "open-door", machine: dryer },
  });
  assert.deepEqual(next.load, { kind: "loaded", machine: dryer });
});

test("open-door does nothing at a washer while carrying wet laundry", () => {
  const state = buildState({ load: { kind: "carrying", laundry: "wet" } });
  const next = transition({
    state,
    event: { type: "open-door", machine: washer },
  });
  assert.equal(next, state);
});

test("open-door loads folded laundry into a washer to wash it again", () => {
  const state = buildState({ load: { kind: "folded" } });
  const next = transition({
    state,
    event: { type: "open-door", machine: washer },
  });
  assert.deepEqual(next.load, { kind: "loaded", machine: washer });
});

test("open-door does nothing at a dryer while holding folded laundry", () => {
  const state = buildState({ load: { kind: "folded" } });
  const next = transition({
    state,
    event: { type: "open-door", machine: dryer },
  });
  assert.equal(next, state);
});

test("open-door on the loaded washer takes the dirty laundry back out", () => {
  const state = buildState({ load: { kind: "loaded", machine: washer } });
  const next = transition({
    state,
    event: { type: "open-door", machine: washer },
  });
  assert.deepEqual(next.load, { kind: "carrying", laundry: "dirty" });
});

test("open-door on the loaded dryer takes the wet laundry back out", () => {
  const state = buildState({ load: { kind: "loaded", machine: dryer } });
  const next = transition({
    state,
    event: { type: "open-door", machine: dryer },
  });
  assert.deepEqual(next.load, { kind: "carrying", laundry: "wet" });
});

test("open-door on another machine does nothing while laundry is loaded", () => {
  const state = buildState({ load: { kind: "loaded", machine: washer } });
  const next = transition({
    state,
    event: { type: "open-door", machine: otherWasher },
  });
  assert.equal(next, state);
});

test("open-door does nothing while the cycle runs", () => {
  const state = buildRunning({ machine: washer });
  for (const machine of [washer, otherWasher, dryer]) {
    assert.equal(
      transition({ state, event: { type: "open-door", machine } }),
      state
    );
  }
});

test("open-door on a done washer takes the laundry out wet", () => {
  const state = buildState({ load: { kind: "done", machine: washer } });
  const next = transition({
    state,
    event: { type: "open-door", machine: washer },
  });
  assert.deepEqual(next.load, { kind: "carrying", laundry: "wet" });
});

test("open-door on a done dryer takes the laundry out folded", () => {
  const state = buildState({ load: { kind: "done", machine: dryer } });
  const next = transition({
    state,
    event: { type: "open-door", machine: dryer },
  });
  assert.deepEqual(next.load, { kind: "folded" });
});

test("open-door on another machine does nothing while a cycle is done", () => {
  const state = buildState({ load: { kind: "done", machine: washer } });
  const next = transition({
    state,
    event: { type: "open-door", machine: otherWasher },
  });
  assert.equal(next, state);
});

test("turn-dial steps forward from the default", () => {
  const next = transition({
    state: INITIAL_LAUNDRY_STATE,
    event: { type: "turn-dial", machine: washer, step: 1 },
  });
  assert.deepEqual(next.cycleMinutes, { "washer-2": 45 });
});

test("turn-dial steps back from the default", () => {
  const next = transition({
    state: INITIAL_LAUNDRY_STATE,
    event: { type: "turn-dial", machine: dryer, step: -1 },
  });
  assert.deepEqual(next.cycleMinutes, { "dryer-1": 5 });
});

test("turn-dial wraps around past the last and first detents", () => {
  const atLast = buildState({
    load: { kind: "carrying", laundry: "dirty" },
    cycleMinutes: { "washer-2": 60, "dryer-1": 5 },
  });
  const forward = transition({
    state: atLast,
    event: { type: "turn-dial", machine: washer, step: 1 },
  });
  assert.equal(forward.cycleMinutes["washer-2"], 5);
  const back = transition({
    state: atLast,
    event: { type: "turn-dial", machine: dryer, step: -1 },
  });
  assert.equal(back.cycleMinutes["dryer-1"], 60);
});

test("turn-dial works on the loaded machine", () => {
  const state = buildState({ load: { kind: "loaded", machine: washer } });
  const next = transition({
    state,
    event: { type: "turn-dial", machine: washer, step: 1 },
  });
  assert.equal(next.cycleMinutes["washer-2"], 45);
  assert.equal(next.load, state.load);
});

test("turn-dial is locked on the running or done machine but not on others", () => {
  for (const state of [
    buildRunning({ machine: washer }),
    buildState({ load: { kind: "done", machine: washer } }),
  ]) {
    assert.equal(
      transition({
        state,
        event: { type: "turn-dial", machine: washer, step: 1 },
      }),
      state
    );
    const other = transition({
      state,
      event: { type: "turn-dial", machine: otherWasher, step: 1 },
    });
    assert.equal(other.cycleMinutes["washer-3"], 45);
  }
});

test("start runs the loaded machine for its dial length", () => {
  const state = buildState({
    load: { kind: "loaded", machine: washer },
    cycleMinutes: { "washer-2": 25 },
  });
  const next = transition({
    state,
    event: { type: "start", machine: washer, now: startedAt },
  });
  assert.deepEqual(next.load, {
    kind: "running",
    machine: washer,
    startedAt,
    durationMs: 25 * 60_000,
    remind: false,
  });
});

test("start does nothing unless that machine is loaded", () => {
  const states = [
    INITIAL_LAUNDRY_STATE,
    buildState({ load: { kind: "folded" } }),
    buildState({ load: { kind: "loaded", machine: otherWasher } }),
    buildRunning({ machine: washer }),
    buildState({ load: { kind: "done", machine: washer } }),
  ];
  for (const state of states) {
    assert.equal(
      transition({
        state,
        event: { type: "start", machine: washer, now: startedAt },
      }),
      state
    );
  }
});

test("remind turns the reminder on for the running machine", () => {
  const next = transition({
    state: buildRunning({ machine: washer }),
    event: { type: "remind", machine: washer },
  });
  assert.equal(next.load.kind === "running" && next.load.remind, true);
});

test("remind does nothing on another machine, twice, or when not running", () => {
  const running = buildRunning({ machine: washer });
  assert.equal(
    transition({
      state: running,
      event: { type: "remind", machine: otherWasher },
    }),
    running
  );
  const reminded = buildRunning({ machine: washer, remind: true });
  assert.equal(
    transition({ state: reminded, event: { type: "remind", machine: washer } }),
    reminded
  );
  const loaded = buildState({ load: { kind: "loaded", machine: washer } });
  assert.equal(
    transition({ state: loaded, event: { type: "remind", machine: washer } }),
    loaded
  );
});

test("tick keeps the cycle running until its end", () => {
  const state = buildRunning({ machine: washer });
  const next = transition({
    state,
    event: { type: "tick", now: startedAt + 30 * 60_000 - 1 },
  });
  assert.equal(next, state);
});

test("tick finishes the cycle exactly at its end", () => {
  const next = transition({
    state: buildRunning({ machine: washer }),
    event: { type: "tick", now: startedAt + 30 * 60_000 },
  });
  assert.deepEqual(next.load, { kind: "done", machine: washer });
});

test("tick finishes a cycle that ended long ago, as after a reload", () => {
  const next = transition({
    state: buildRunning({ machine: dryer }),
    event: { type: "tick", now: startedAt + 5 * 60 * 60_000 },
  });
  assert.deepEqual(next.load, { kind: "done", machine: dryer });
});

test("tick does nothing when no cycle runs", () => {
  const state = buildState({ load: { kind: "done", machine: washer } });
  assert.equal(
    transition({ state, event: { type: "tick", now: startedAt } }),
    state
  );
});

test("walks the whole wash, dry and wash-again loop", () => {
  const events: LaundryEvent[] = [
    { type: "open-door", machine: washer },
    { type: "start", machine: washer, now: startedAt },
    { type: "tick", now: startedAt + 30 * 60_000 },
    { type: "open-door", machine: washer },
    { type: "open-door", machine: dryer },
    { type: "start", machine: dryer, now: startedAt + 31 * 60_000 },
    { type: "tick", now: startedAt + 41 * 60_000 },
    { type: "open-door", machine: dryer },
    { type: "open-door", machine: washer },
  ];
  const loads = events.reduce<LaundryLoad[]>(
    (all, event) => [
      ...all,
      transition({
        state: buildState({ load: all.at(-1) ?? INITIAL_LAUNDRY_STATE.load }),
        event,
      }).load,
    ],
    []
  );
  assert.deepEqual(
    loads.map((load) => load.kind),
    [
      "loaded",
      "running",
      "done",
      "carrying",
      "loaded",
      "running",
      "done",
      "folded",
      "loaded",
    ]
  );
});

test("collect takes washed or dried laundry home and leaves anything else alone", () => {
  for (const load of [
    { kind: "folded" },
    { kind: "carrying", laundry: "wet" },
  ] satisfies LaundryLoad[]) {
    const next = transition({
      state: buildState({ load }),
      event: { type: "collect" },
    });
    assert.deepEqual(next.load, { kind: "carrying", laundry: "dirty" });
  }
  for (const state of [
    buildState({ load: { kind: "carrying", laundry: "dirty" } }),
    buildState({ load: { kind: "loaded", machine: washer } }),
    buildRunning({ machine: dryer }),
  ]) {
    assert.equal(transition({ state, event: { type: "collect" } }), state);
  }
});
