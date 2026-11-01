import assert from "node:assert/strict";
import { test } from "node:test";

import { buildToys } from "./testing/build-toys";
import { createSeededRandom } from "./create-seeded-random";
import { createWorld } from "./create-world";
import { getToyGap } from "./get-toy-gap";
import { placeToy } from "./place-toy";
import { stepToys } from "./step-toys";
import { TOY_LIMITS } from "./toy-limits";

test("a toy is placed once, and again only after the used-up one has faded away", () => {
  const world = createWorld({ random: createSeededRandom({ seed: 1 }) });
  assert.ok(placeToy({ world, itemId: "roll-2", x: -50, y: 400 }));
  const roll = world.toys.at(0);
  assert.ok(roll?.kind === "roll" && roll.isStanding && roll.x > 0);
  assert.equal(placeToy({ world, itemId: "roll-2", x: 900, y: 400 }), false);
  assert.equal(world.toys.length, 1);
  roll.isStanding = false;
  roll.unrolled = TOY_LIMITS.maxUnrolled;
  const tick = { world, dtSeconds: 0.5, events: [] };
  for (let t = 0; t <= TOY_LIMITS.fadeSeconds + 1; t += 0.5) stepToys(tick);
  assert.equal(world.toys.length, 0);
  assert.ok(placeToy({ world, itemId: "roll-2", x: 900, y: 400 }));
});

test("a toy dropped on a bowl or a box lands at the nearest clear spot instead", () => {
  const world = createWorld({ random: createSeededRandom({ seed: 2 }) });
  world.toys = buildToys().filter(
    (toy) => toy.kind === "bowl" || toy.kind === "box"
  );
  const bowl = world.toys.find((toy) => toy.kind === "bowl");
  const box = world.toys.find((toy) => toy.kind === "box");
  assert.ok(bowl !== undefined && box !== undefined);
  assert.ok(placeToy({ world, itemId: "yarn-1", x: bowl.x, y: bowl.y }));
  assert.ok(placeToy({ world, itemId: "roll-1", x: box.x, y: box.y }));
  for (const id of ["yarn-1", "roll-1"]) {
    const toy = world.toys.find((candidate) => candidate.id === id);
    assert.ok(toy !== undefined);
    for (const other of world.toys.filter((candidate) => candidate !== toy))
      assert.ok(
        getToyGap({ a: toy, b: other }) >= 0,
        `${id} overlaps ${other.id}`
      );
  }
  const yarn = world.toys.find((toy) => toy.id === "yarn-1");
  assert.ok(
    yarn !== undefined && Math.hypot(yarn.x - bowl.x, yarn.y - bowl.y) < 80
  );
});

test("a yarn ball rolling into a bowl is pushed out and the bowl stays put", () => {
  const world = createWorld({ random: createSeededRandom({ seed: 3 }) });
  world.toys = buildToys();
  const bowl = world.toys.find((toy) => toy.kind === "bowl");
  const yarn = world.toys.find((toy) => toy.kind === "yarn");
  assert.ok(bowl !== undefined && yarn !== undefined);
  yarn.x = bowl.x + 5;
  yarn.y = bowl.y;
  const before = { x: bowl.x, y: bowl.y };
  stepToys({ world, dtSeconds: 1 / 60, events: [] });
  assert.ok(getToyGap({ a: yarn, b: bowl }) >= -0.5);
  assert.deepEqual({ x: bowl.x, y: bowl.y }, before);
});
