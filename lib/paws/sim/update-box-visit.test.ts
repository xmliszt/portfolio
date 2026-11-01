import assert from "node:assert/strict";
import { test } from "node:test";

import { buildLook } from "./testing/build-look";
import { buildSnapshot } from "./testing/build-snapshot";
import { buildToys } from "./testing/build-toys";
import { runWorld } from "./testing/run-world";
import { createSeededRandom } from "./create-seeded-random";
import { createWorldFromSnapshots } from "./create-world-from-snapshots";
import { getBoxGap } from "./get-box-gap";
import type { World } from "./sim-types";
import { startBoxVisit } from "./start-box-visit";

const players = ["a", "b"].map((userId) => ({ userId, look: buildLook() }));

function buildRoom() {
  const world = createWorldFromSnapshots({
    random: createSeededRandom({ seed: 5 }),
    snapshots: [
      buildSnapshot({ userId: "a", x: 820, y: 300 }),
      buildSnapshot({ userId: "b", x: 820, y: 620 }),
    ],
    players,
    toys: buildToys(),
    trails: [],
  });
  const box = world.toys.find((toy) => toy.kind === "box");
  assert.ok(box !== undefined);
  return { world, box };
}

function runUntil(options: {
  world: World;
  seconds: number;
  isDone: () => boolean;
  fingers?: Parameters<typeof runWorld>[0]["fingers"];
}) {
  for (let t = 0; t < options.seconds && !options.isDone(); t += 0.5)
    runWorld({
      world: options.world,
      players,
      fingers: options.fingers,
      seconds: 0.5,
    });
}

test("a cat walks to the box, hops in and rests inside, nudging the box", () => {
  const { world, box } = buildRoom();
  const cat = world.cats.a;
  const start = { x: box.x, y: box.y };
  assert.ok(startBoxVisit({ world, cat }));
  runUntil({
    world,
    seconds: 30,
    isDone: () => cat.boxVisit?.phase === "in",
  });
  assert.equal(cat.boxVisit?.phase, "in", "the cat never got in");
  assert.ok(getBoxGap({ box, x: cat.x, y: cat.y }) < 0, "the cat is inside");
  assert.ok(
    Math.hypot(box.x - start.x, box.y - start.y) > 1,
    "the landing shifts the box"
  );
  assert.equal(
    startBoxVisit({ world, cat: world.cats.b }),
    false,
    "a second cat finds the box taken"
  );
});

test("pressing on the box wakes the cat, which hops out and wanders off", () => {
  const { world, box } = buildRoom();
  const cat = world.cats.a;
  startBoxVisit({ world, cat });
  runUntil({ world, seconds: 30, isDone: () => cat.boxVisit?.phase === "in" });
  runUntil({ world, seconds: 3, isDone: () => false });
  runUntil({
    world,
    seconds: 10,
    isDone: () => cat.boxVisit === undefined,
    fingers: [{ userId: "b", x: box.x, y: box.y, pressed: true }],
  });
  assert.equal(cat.boxVisit, undefined, "the cat stayed in the box");
  assert.ok(
    getBoxGap({ box, x: cat.x, y: cat.y }) > 0,
    "the cat landed outside the box"
  );
});

test("two cats can rest in two boxes at once, the second picking the free one", () => {
  const { world, box } = buildRoom();
  const second = { ...box, id: "box-2", x: 1300, y: 300 };
  world.toys = [...world.toys, second];
  assert.ok(startBoxVisit({ world, cat: world.cats.a, boxId: box.id }));
  assert.ok(
    startBoxVisit({ world, cat: world.cats.b, boxId: box.id }) === false
  );
  assert.ok(startBoxVisit({ world, cat: world.cats.b }));
  assert.equal(world.cats.b.boxVisit?.boxId, "box-2");
  runUntil({
    world,
    seconds: 40,
    isDone: () =>
      world.cats.a.boxVisit?.phase === "in" &&
      world.cats.b.boxVisit?.phase === "in",
  });
  assert.equal(world.cats.a.boxVisit?.phase, "in");
  assert.equal(world.cats.b.boxVisit?.phase, "in");
  assert.ok(
    getBoxGap({ box: second, x: world.cats.b.x, y: world.cats.b.y }) < 0
  );
});
