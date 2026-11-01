import assert from "node:assert/strict";
import { test } from "node:test";

import { buildLook } from "./testing/build-look";
import { buildSnapshot } from "./testing/build-snapshot";
import { buildToys } from "./testing/build-toys";
import { bumpToys } from "./bump-toys";
import { createSeededRandom } from "./create-seeded-random";
import { createWorldFromSnapshots } from "./create-world-from-snapshots";

function buildRoom(options: { toyId: string }) {
  const world = createWorldFromSnapshots({
    random: createSeededRandom({ seed: 4 }),
    snapshots: [buildSnapshot({ userId: "a", x: 800, y: 500 })],
    players: [{ userId: "a", look: buildLook() }],
    toys: buildToys(),
    trails: [],
  });
  const cat = world.cats.a;
  const toy = world.toys.find((candidate) => candidate.id === options.toyId);
  assert.ok(toy !== undefined);
  return { world, cat, toy };
}

test("a walking cat's paw pushes a toy it walks into", () => {
  const { world, cat, toy } = buildRoom({ toyId: "yarn-1" });
  const paw = cat.legs[0];
  paw.h = 0;
  cat.speed = 90;
  cat.weights = { stand: 1, sit: 0, sleep: 0 };
  toy.x = paw.x + 4;
  toy.y = paw.y;
  bumpToys({ toys: world.toys, cats: [cat] });
  assert.ok(
    Math.hypot(toy.x - paw.x, toy.y - paw.y) > 4,
    "the toy is pushed out of the paw"
  );
  assert.ok(toy.vx >= 89, `the toy moves off as fast as the cat, ${toy.vx}`);
});

test("a fast cat knocks a standing roll over", () => {
  const { world, cat, toy } = buildRoom({ toyId: "roll-1" });
  assert.ok(toy.kind === "roll" && toy.isStanding);
  const paw = cat.legs[0];
  paw.h = 0;
  cat.speed = 200;
  cat.weights = { stand: 1, sit: 0, sleep: 0 };
  toy.x = paw.x + 4;
  toy.y = paw.y;
  bumpToys({ toys: world.toys, cats: [cat] });
  assert.equal(toy.isStanding, false);
});

test("a sleeping cat's body pushes a toy aside without flinging it", () => {
  const { world, cat, toy } = buildRoom({ toyId: "bowl-1" });
  cat.weights = { stand: 0, sit: 0, sleep: 1 };
  toy.x = cat.x;
  toy.y = cat.y + 1;
  bumpToys({ toys: world.toys, cats: [cat] });
  assert.ok(Math.hypot(toy.x - cat.x, toy.y - cat.y) > 1, "the bowl moved");
  assert.equal(Math.hypot(toy.vx, toy.vy), 0);
});

test("a paw reaching for the toy on purpose does not push it", () => {
  const { world, cat, toy } = buildRoom({ toyId: "yarn-1" });
  const paw = cat.legs[0];
  paw.h = 0;
  paw.reach = {
    phase: "planted",
    t: 0.1,
    notice: 0,
    fromX: paw.x,
    fromY: paw.y,
    fromH: 0,
    toX: paw.x,
    toY: paw.y,
    endH: 0,
    durationSeconds: 0.3,
    lift: 0,
    target: { kind: "finger", userId: "toy:yarn-1" },
    reactSeconds: 1,
    kneadSeconds: 3,
    waitSeconds: 1,
  };
  cat.weights = { stand: 1, sit: 0, sleep: 0 };
  for (const leg of cat.legs.slice(1)) leg.h = 999;
  toy.x = paw.x + 4;
  toy.y = paw.y;
  bumpToys({ toys: world.toys, cats: [cat] });
  assert.equal(toy.x, paw.x + 4);
});
