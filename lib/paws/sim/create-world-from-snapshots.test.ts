import assert from "node:assert/strict";
import { test } from "node:test";

import { buildLook } from "./testing/build-look";
import { buildSnapshot } from "./testing/build-snapshot";
import { runWorld } from "./testing/run-world";
import { createSeededRandom } from "./create-seeded-random";
import { createWorld } from "./create-world";
import { createWorldFromSnapshots } from "./create-world-from-snapshots";
import { getCatSnapshots } from "./get-cat-snapshots";

const players = Array.from({ length: 5 }, (_, i) => ({
  userId: `player-${i}`,
  look: buildLook(),
}));

test("a snapshot survives the trip into a new world and back", () => {
  const snapshot = buildSnapshot({
    userId: "player-0",
    x: 420,
    y: 610,
    heading: 2.5,
    pose: { stand: 0.2, sit: 0.8, sleep: 0 },
    activity: "sit",
  });
  const world = createWorldFromSnapshots({
    random: createSeededRandom({ seed: 1 }),
    snapshots: [snapshot],
    players,
  });
  assert.deepEqual(getCatSnapshots(world), [snapshot]);
});

test("a new host carries on where the old one stopped", () => {
  const old = createWorld({ random: createSeededRandom({ seed: 2 }) });
  runWorld({ world: old, players, seconds: 40 });
  const handoff = getCatSnapshots(old);
  const next = createWorldFromSnapshots({
    random: createSeededRandom({ seed: 99 }),
    snapshots: handoff,
    players,
  });
  runWorld({ world: old, players, seconds: 0.1 });
  runWorld({ world: next, players, seconds: 0.1 });
  const before = getCatSnapshots(old);
  const after = getCatSnapshots(next);
  assert.equal(after.length, handoff.length);
  for (const cat of after) {
    const reference = before.find(
      (candidate) => candidate.userId === cat.userId
    );
    assert.ok(reference !== undefined);
    assert.ok(
      Math.hypot(cat.x - reference.x, cat.y - reference.y) < 15,
      `${cat.userId} jumps ${Math.hypot(cat.x - reference.x, cat.y - reference.y)}`
    );
    assert.ok(
      Math.abs(cat.pose.sit - reference.pose.sit) < 0.1,
      `${cat.userId} keeps its pose`
    );
    assert.ok(
      Math.abs(cat.pose.sleep - reference.pose.sleep) < 0.1,
      `${cat.userId} keeps sleeping`
    );
    for (const [i, leg] of cat.legs.entries()) {
      assert.ok(
        Math.hypot(leg.x - reference.legs[i].x, leg.y - reference.legs[i].y) <
          15,
        `${cat.userId} leg ${i} stays put`
      );
    }
  }
});
