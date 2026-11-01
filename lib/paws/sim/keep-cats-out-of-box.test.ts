import assert from "node:assert/strict";
import { test } from "node:test";

import { buildLook } from "./testing/build-look";
import { buildSnapshot } from "./testing/build-snapshot";
import { buildToys } from "./testing/build-toys";
import { createSeededRandom } from "./create-seeded-random";
import { createWorldFromSnapshots } from "./create-world-from-snapshots";
import { getBoxGap } from "./get-box-gap";
import { BOX_CLEARANCE, keepCatsOutOfBox } from "./keep-cats-out-of-box";
import { startBoxVisit } from "./start-box-visit";

function buildRoom(options: { catX: number }) {
  const world = createWorldFromSnapshots({
    random: createSeededRandom({ seed: 2 }),
    snapshots: [buildSnapshot({ userId: "a", x: options.catX, y: 270 })],
    players: [{ userId: "a", look: buildLook() }],
    toys: buildToys(),
    trails: [],
  });
  const box = world.toys.find((toy) => toy.kind === "box");
  assert.ok(box !== undefined);
  return { world, box, cat: world.cats.a };
}

test("a cat walking up to the box is pushed back clear of its walls", () => {
  const { world, box, cat } = buildRoom({ catX: 590 });
  keepCatsOutOfBox(world);
  assert.ok(
    getBoxGap({ box, x: cat.x, y: cat.y }) >=
      BOX_CLEARANCE * cat.build.scale - 0.5,
    "the cat stands clear of the box"
  );
});

test("a cat hopping into the box is left where it is", () => {
  const { world, cat } = buildRoom({ catX: 590 });
  startBoxVisit({ world, cat });
  assert.ok(cat.boxVisit !== undefined);
  cat.boxVisit.phase = "hop";
  keepCatsOutOfBox(world);
  assert.equal(cat.x, 590);
});
