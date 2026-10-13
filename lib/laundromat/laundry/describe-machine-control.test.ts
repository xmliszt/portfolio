import assert from "node:assert/strict";
import { test } from "node:test";

import { en } from "@/lib/laundromat/i18n/copy/en";

import { describeMachine } from "./describe-machine";
import { describeMachineControl } from "./describe-machine-control";
import type { MachineStatus } from "./get-machine-status";
import { getMachineStatus } from "./get-machine-status";
import type { LaundryState, MachineRef } from "./laundry-state";

const washer: MachineRef = { id: "washer-2", kind: "washer", number: 2 };
const dryer: MachineRef = { id: "dryer-1", kind: "dryer", number: 1 };
const endsAt = new Date(2026, 0, 1, 1, 24).getTime();
const running: MachineStatus = {
  kind: "running",
  endsAt,
  remainingMs: 1_122_000,
  remind: false,
};

function describe(options: {
  control: "dial" | "start" | "door";
  status: MachineStatus;
  notifications?: "default" | "granted" | "denied" | "unsupported";
}) {
  return describeMachineControl({
    control: options.control,
    machine: washer,
    status: options.status,
    minutes: 30,
    nextMinutes: 45,
    copy: en,
    notifications: options.notifications ?? "default",
  });
}

test("reports which machines can take the laundry being carried", () => {
  const dirty: LaundryState = {
    load: { kind: "carrying", laundry: "dirty" },
    cycleMinutes: {},
  };
  assert.deepEqual(
    getMachineStatus({ state: dirty, machine: washer, now: 0 }),
    {
      kind: "loadable",
    }
  );
  assert.deepEqual(getMachineStatus({ state: dirty, machine: dryer, now: 0 }), {
    kind: "unavailable",
    reason: { kind: "needs-washing" },
  });
  const wet: LaundryState = {
    load: { kind: "carrying", laundry: "wet" },
    cycleMinutes: {},
  };
  assert.deepEqual(getMachineStatus({ state: wet, machine: dryer, now: 0 }), {
    kind: "loadable",
  });
  assert.deepEqual(getMachineStatus({ state: wet, machine: washer, now: 0 }), {
    kind: "unavailable",
    reason: { kind: "already-washed" },
  });
});

test("reports the remaining time of the running machine only", () => {
  const state: LaundryState = {
    load: {
      kind: "running",
      machine: washer,
      startedAt: 0,
      durationMs: 60_000,
      remind: true,
    },
    cycleMinutes: {},
  };
  assert.deepEqual(getMachineStatus({ state, machine: washer, now: 15_000 }), {
    kind: "running",
    endsAt: 60_000,
    remainingMs: 45_000,
    remind: true,
  });
  assert.deepEqual(
    getMachineStatus({ state, machine: { ...washer, id: "washer-1" }, now: 0 }),
    {
      kind: "unavailable",
      reason: { kind: "elsewhere", machine: washer, phase: "running" },
    }
  );
});

test("start and door on another machine say where the laundry is", () => {
  const status = {
    kind: "unavailable",
    reason: { kind: "elsewhere", machine: washer, phase: "running" },
  } satisfies MachineStatus;
  assert.deepEqual(
    describeMachineControl({
      control: "start",
      machine: dryer,
      status,
      minutes: 30,
      nextMinutes: 45,
      copy: en,
      notifications: "default",
    }),
    {
      label: "Dryer 1 start",
      tooltip: "your clothes are still being washed",
      enabled: false,
    }
  );
  assert.equal(
    describe({
      control: "door",
      status: {
        kind: "unavailable",
        reason: { kind: "elsewhere", machine: dryer, phase: "done" },
      },
    }).tooltip,
    "your laundry is done · in dryer 1"
  );
});

test("the dial names its next detent unless the machine is busy", () => {
  assert.deepEqual(
    describe({ control: "dial", status: { kind: "loadable" } }),
    {
      label: "Washer 2 cycle, 30 minutes",
      tooltip: "turn · 30 min → 45 min",
      enabled: true,
    }
  );
  assert.deepEqual(describe({ control: "dial", status: running }), {
    label: "Washer 2 cycle, 30 minutes",
    tooltip: undefined,
    enabled: false,
  });
});

test("start starts a loaded machine and asks to load an empty one", () => {
  assert.deepEqual(describe({ control: "start", status: { kind: "loaded" } }), {
    label: "Washer 2 start, 30 minute wash, notifies you when done",
    tooltip: "start · 30 min wash · notifies you",
    enabled: true,
  });
  assert.equal(
    describe({
      control: "start",
      status: { kind: "loaded" },
      notifications: "denied",
    }).tooltip,
    "start · 30 min wash"
  );
  assert.equal(
    describe({ control: "start", status: { kind: "loadable" } }).tooltip,
    "load laundry first"
  );
  assert.equal(
    describe({ control: "start", status: { kind: "done" } }).tooltip,
    undefined
  );
});

test("start offers a reminder while running, only when notifications can be asked for", () => {
  assert.deepEqual(describe({ control: "start", status: running }), {
    label: "Washer 2, remind me when the wash is done",
    tooltip: "remind me · done at 1:24 a.m.",
    enabled: true,
  });
  assert.deepEqual(
    describe({ control: "start", status: { ...running, remind: true } }),
    {
      label: "Washer 2 start, reminder on, done at 1:24 a.m.",
      tooltip: "reminder on · done at 1:24 a.m.",
      enabled: false,
    }
  );
  assert.equal(
    describe({ control: "start", status: running, notifications: "denied" })
      .tooltip,
    "done at 1:24 a.m."
  );
});

test("the door says what opening it does in each status", () => {
  const tooltips = (
    [
      { kind: "loadable" },
      { kind: "loaded" },
      running,
      { kind: "done" },
      { kind: "unavailable", reason: { kind: "needs-washing" } },
    ] satisfies MachineStatus[]
  ).map((status) => describe({ control: "door", status }));
  assert.deepEqual(
    tooltips.map(({ tooltip, enabled }) => [tooltip, enabled]),
    [
      ["load laundry", true],
      ["open door · take laundry back out", true],
      ["washing · done at 1:24 a.m.", false],
      ["open door · take laundry out", true],
      ["wash it first", false],
    ]
  );
  assert.equal(
    tooltips.at(3)?.label,
    "Washer 2 door, open door · take laundry out"
  );
});

test("the machine body states its status", () => {
  assert.deepEqual(
    describeMachine({ machine: washer, status: running, copy: en }),
    {
      label: "Washer 2, washing, 18:42 left",
      tooltip: "washing · done at 1:24 a.m.",
    }
  );
  assert.deepEqual(
    describeMachine({
      machine: dryer,
      status: { kind: "done" },
      copy: en,
    }),
    {
      label: "Dryer 1, done, take your laundry out",
      tooltip: "dryer 1 · done",
    }
  );
});
