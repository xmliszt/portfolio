import assert from "node:assert/strict";
import { test } from "node:test";

import { assignRemoteMachines } from "./assign-remote-machines";

const machines = [
  { id: "washer-1", kind: "washer" as const },
  { id: "washer-2", kind: "washer" as const },
  { id: "washer-3", kind: "washer" as const },
  { id: "washer-4", kind: "washer" as const },
  { id: "dryer-1", kind: "dryer" as const },
  { id: "dryer-2", kind: "dryer" as const },
];
const now = Date.UTC(2026, 9, 11, 10);

function buildWashingPresence(options: {
  visitorId: string;
  startedMinutesAgo?: number;
}) {
  const { visitorId, startedMinutesAgo = 1 } = options;
  return {
    visitorId,
    load: {
      phase: "running" as const,
      kind: "washer" as const,
      startedAt: now - startedMinutesAgo * 60_000,
      durationMs: 25 * 60_000,
    },
  };
}

test("leaves one washer free for the visitor when five others are washing", () => {
  const assigned = assignRemoteMachines({
    machines,
    ownMachineId: undefined,
    ownRegion: undefined,
    others: ["a", "b", "c", "d", "e"].map((visitorId) =>
      buildWashingPresence({ visitorId })
    ),
    now,
  });
  const washers = Object.keys(assigned).filter((id) => id.startsWith("washer"));
  assert.equal(washers.length, 3);
});

test("never puts another load on the visitor's own machine", () => {
  const assigned = assignRemoteMachines({
    machines,
    ownMachineId: "washer-2",
    ownRegion: undefined,
    others: ["a", "b", "c", "d"].map((visitorId) =>
      buildWashingPresence({ visitorId })
    ),
    now,
  });
  assert.equal(assigned["washer-2"], undefined);
  assert.equal(Object.keys(assigned).length, 3);
});

test("keeps the oldest loads when there are more than fit", () => {
  const assigned = assignRemoteMachines({
    machines,
    ownMachineId: undefined,
    ownRegion: undefined,
    others: [
      buildWashingPresence({ visitorId: "new", startedMinutesAgo: 1 }),
      buildWashingPresence({ visitorId: "old", startedMinutesAgo: 20 }),
      buildWashingPresence({ visitorId: "mid", startedMinutesAgo: 10 }),
      buildWashingPresence({ visitorId: "x", startedMinutesAgo: 2 }),
    ],
    now,
  });
  const visitors = Object.values(assigned).map(({ visitorId }) => visitorId);
  assert.deepEqual(visitors.toSorted(), ["mid", "old", "x"]);
});

test("keeps a visitor on the same machine as others come and go", () => {
  const alone = assignRemoteMachines({
    machines,
    ownMachineId: undefined,
    ownRegion: undefined,
    others: [
      buildWashingPresence({ visitorId: "steady", startedMinutesAgo: 5 }),
    ],
    now,
  });
  const crowded = assignRemoteMachines({
    machines,
    ownMachineId: undefined,
    ownRegion: undefined,
    others: [
      buildWashingPresence({ visitorId: "steady", startedMinutesAgo: 5 }),
      buildWashingPresence({ visitorId: "later", startedMinutesAgo: 1 }),
    ],
    now,
  });
  const machineOf = (assigned: typeof alone) =>
    Object.entries(assigned).find(
      ([, { visitorId }]) => visitorId === "steady"
    )?.[0];
  assert.equal(machineOf(crowded), machineOf(alone));
});

test("drops a load once it has sat done for a while", () => {
  const assigned = assignRemoteMachines({
    machines,
    ownMachineId: undefined,
    ownRegion: undefined,
    others: [
      buildWashingPresence({ visitorId: "long-gone", startedMinutesAgo: 60 }),
    ],
    now,
  });
  assert.deepEqual(assigned, {});
});

test("shows a visitor with two tabs open on one machine only", () => {
  const assigned = assignRemoteMachines({
    machines,
    ownMachineId: undefined,
    ownRegion: undefined,
    others: [
      buildWashingPresence({ visitorId: "two-tabs" }),
      buildWashingPresence({ visitorId: "two-tabs" }),
    ],
    now,
  });
  assert.equal(Object.keys(assigned).length, 1);
});

test("shows nearby visitors before earlier ones far away", () => {
  const near = { latDeg: 1, lonDeg: 104 };
  const far = { latDeg: 52, lonDeg: 0 };
  const assigned = assignRemoteMachines({
    machines,
    ownMachineId: undefined,
    ownRegion: near,
    others: [
      {
        ...buildWashingPresence({ visitorId: "far-1", startedMinutesAgo: 9 }),
        region: far,
      },
      {
        ...buildWashingPresence({ visitorId: "far-2", startedMinutesAgo: 8 }),
        region: far,
      },
      {
        ...buildWashingPresence({ visitorId: "far-3", startedMinutesAgo: 7 }),
        region: far,
      },
      {
        ...buildWashingPresence({ visitorId: "near", startedMinutesAgo: 1 }),
        region: near,
      },
    ],
    now,
  });
  const shown = Object.values(assigned).map(({ visitorId }) => visitorId);
  assert.ok(shown.includes("near"), "the nearby visitor is shown");
  assert.ok(!shown.includes("far-3"), "the latest far visitor makes room");
});

test("keeps laundry that is loaded or done in its machine until it is taken out", () => {
  const assigned = assignRemoteMachines({
    machines,
    ownMachineId: undefined,
    ownRegion: undefined,
    others: [
      { visitorId: "loaded", load: { phase: "loaded", kind: "washer" } },
      { visitorId: "done", load: { phase: "done", kind: "washer" } },
    ],
    now,
  });
  const shown = Object.values(assigned).map(({ visitorId, load }) => [
    visitorId,
    load.phase,
  ]);
  assert.deepEqual(shown.toSorted(), [
    ["done", "done"],
    ["loaded", "loaded"],
  ]);
});
