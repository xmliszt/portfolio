import assert from "node:assert/strict";
import { test } from "node:test";

import { buildLook } from "./testing/build-look";
import { runWorld } from "./testing/run-world";
import { createSeededRandom } from "./create-seeded-random";
import { createWorld } from "./create-world";
import type { FingerInput, World } from "./sim-types";

const players = [{ userId: "cat", look: buildLook({ size: "medium" }) }];

function settledWorld() {
  const world = createWorld({ random: createSeededRandom({ seed: 8 }) });
  runWorld({ world, players, seconds: 12 });
  return world;
}

test("a cat backs away when three cursors crowd it", () => {
  const world = settledWorld();
  const start = { x: world.cats.cat.x, y: world.cats.cat.y };
  const crowd = (current: World): FingerInput[] =>
    [0, 1, 2].map((index) => ({
      userId: `visitor-${index}`,
      x: start.x + Math.cos(index * 2.1) * 120,
      y: start.y + Math.sin(index * 2.1) * 120 + Math.sin(current.time) * 4,
      pressed: false,
    }));
  runWorld({ world, players, fingers: crowd, seconds: 3 });
  const cat = world.cats.cat;
  assert.equal(cat.focusId, undefined, "stops following any cursor");
  assert.ok(
    Math.hypot(cat.x - start.x, cat.y - start.y) > 40,
    "walks away from the crowd"
  );
});

test("a wiggling cursor steals a cat from a still one", () => {
  const world = settledWorld();
  const cat = world.cats.cat;
  const still: FingerInput = {
    userId: "still",
    x: cat.x + 150,
    y: cat.y,
    pressed: false,
  };
  runWorld({
    world,
    players,
    fingers: [still],
    seconds: 15,
  });
  const focusedOnStill = world.cats.cat.focusId === "still";
  const wiggle = (current: World): FingerInput[] => [
    still,
    {
      userId: "wiggle",
      x: world.cats.cat.x - 120 + Math.sin(current.time * 14) * 60,
      y: world.cats.cat.y + 60,
      pressed: false,
    },
  ];
  const focuses: (string | undefined)[] = [];
  runWorld({
    world,
    players,
    fingers: wiggle,
    seconds: 8,
    onStep: (current) => focuses.push(current.cats.cat.focusId),
  });
  assert.ok(focusedOnStill, "first follows the still cursor");
  assert.ok(focuses.includes("wiggle"), "turns to the wiggling cursor");
});
