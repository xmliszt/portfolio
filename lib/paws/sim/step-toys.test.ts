import assert from "node:assert/strict";
import { test } from "node:test";

import { buildLook } from "./testing/build-look";
import { buildSnapshot } from "./testing/build-snapshot";
import { buildToys } from "./testing/build-toys";
import { runWorld } from "./testing/run-world";
import { createResidentWorld } from "./create-resident-world";
import { createSeededRandom } from "./create-seeded-random";
import { createWorldFromSnapshots } from "./create-world-from-snapshots";
import { getToyFingerId } from "./get-toy-finger-id";
import { getToyFingers } from "./get-toy-fingers";
import { getToyRadius } from "./get-toy-radius";
import { makeCurious } from "./make-curious";
import type { SimCat, Tick, World } from "./sim-types";
import { stepToys } from "./step-toys";
import { TOY_LIMITS } from "./toy-limits";

const players = Array.from({ length: 4 }, (_, i) => ({
  userId: `player-${i}`,
  look: buildLook(),
}));

function buildRoom(options: { seed: number; catX: number; catY: number }) {
  const look = buildLook();
  return createWorldFromSnapshots({
    random: createSeededRandom({ seed: options.seed }),
    snapshots: [
      buildSnapshot({ userId: "a", x: options.catX, y: options.catY }),
    ],
    players: [{ userId: "a", look }],
    toys: buildToys(),
    trails: [],
  });
}

function landPaw(options: { cat: SimCat; toyId: string }) {
  const leg = options.cat.legs[0];
  leg.reach = {
    phase: "planted",
    t: 0,
    notice: 0,
    fromX: leg.x,
    fromY: leg.y,
    fromH: 0,
    toX: leg.x,
    toY: leg.y,
    endH: 0,
    durationSeconds: 0.3,
    lift: 0,
    target: { kind: "finger", userId: getToyFingerId(options.toyId) },
    reactSeconds: 1,
    kneadSeconds: 3,
    waitSeconds: 1,
  };
}

function batUntil(options: {
  world: World;
  toyId: string;
  isDone: () => boolean;
}) {
  const cat = options.world.cats.a;
  const tick: Tick = { world: options.world, dtSeconds: 1 / 60, events: [] };
  for (let i = 0; i < 30 && !options.isDone(); i++) {
    landPaw({ cat, toyId: options.toyId });
    stepToys(tick);
  }
  cat.legs[0].reach = undefined;
}

function stepFor(options: { world: World; seconds: number }) {
  const tick: Tick = { world: options.world, dtSeconds: 0.1, events: [] };
  for (let t = 0; t < options.seconds; t += 0.1) stepToys(tick);
}

test("cats find the toys and knock them about", () => {
  const world = createResidentWorld({
    random: createSeededRandom({ seed: 3 }),
    players,
  });
  world.toys = buildToys();
  const start = buildToys();
  runWorld({ world, players, seconds: 240 });
  const moved = world.toys.filter((toy) => {
    const before = start.find((candidate) => candidate.id === toy.id);
    return (
      before !== undefined &&
      Math.hypot(toy.x - before.x, toy.y - before.y) > 40
    );
  });
  assert.ok(moved.length > 0, "no toy moved in four minutes");
  for (const toy of world.toys) {
    assert.ok(toy.x >= 0 && toy.x <= world.width, `${toy.id} left the room`);
    assert.ok(toy.y >= 0 && toy.y <= world.height, `${toy.id} left the room`);
    assert.ok(toy.h >= 0, `${toy.id} sank below the glass`);
  }
});

test("a toy far away does not take a cat from a visitor's finger", () => {
  const world = buildRoom({ seed: 4, catX: 800, catY: 500 });
  const hovering = { userId: "visitor", x: 860, y: 500, pressed: false };
  runWorld({
    world,
    players: [{ userId: "a", look: buildLook() }],
    fingers: [hovering],
    seconds: 0.1,
  });
  makeCurious({ world, cat: world.cats.a, fingerId: "visitor" });
  runWorld({
    world,
    players: [{ userId: "a", look: buildLook() }],
    fingers: [hovering],
    seconds: 6,
  });
  const cat = world.cats.a;
  assert.equal(cat.focusId, "visitor");
  assert.ok(
    cat.pawFingerIds.every((id) => !id.startsWith("toy:")),
    `paws on ${cat.pawFingerIds.join(", ")}`
  );
});

test("a cat playing with a toy gets bored like it does with a finger", () => {
  const world = buildRoom({ seed: 6, catX: 520, catY: 700 });
  const yarnId = getToyFingerId("yarn-1");
  const spans: number[] = [];
  const since: { at: number | undefined } = { at: undefined };
  runWorld({
    world,
    players: [{ userId: "a", look: buildLook() }],
    seconds: 120,
    onStep: (current) => {
      const isHolding = current.cats.a?.pawFingerIds.includes(yarnId) ?? false;
      if (isHolding && since.at === undefined) since.at = current.time;
      if (!isHolding && since.at !== undefined) {
        spans.push(current.time - since.at);
        since.at = undefined;
      }
    },
  });
  assert.ok(spans.length >= 1, "the cat never let go of the yarn");
  for (const span of spans) assert.ok(span <= 25.1, `held for ${span} s`);
});

test("a knocked roll lays its strip as it unrolls, then fades with it and leaves the room once its paper runs out", () => {
  const world = buildRoom({ seed: 1, catX: 1100, catY: 290 });
  const roll = world.toys.find((toy) => toy.kind === "roll");
  assert.ok(roll?.kind === "roll");
  batUntil({ world, toyId: "roll-1", isDone: () => !roll.isStanding });
  assert.equal(roll.isStanding, false);
  stepFor({ world, seconds: 2 });
  assert.ok(roll.unrolled > 0, "no paper came off");
  assert.ok((world.trails["roll-1"]?.length ?? 0) > 1, "no strip was laid");
  roll.unrolled = TOY_LIMITS.maxUnrolled;
  stepFor({ world, seconds: TOY_LIMITS.fadeSeconds / 2 });
  assert.ok(roll.fade > 0.4 && roll.fade < 0.6, `fade ${roll.fade}`);
  assert.equal(roll.isStanding, false, "the used-up roll stood up again");
  stepFor({ world, seconds: TOY_LIMITS.fadeSeconds / 2 + 1 });
  assert.equal(
    world.toys.some((toy) => toy.id === "roll-1"),
    false
  );
  assert.equal(world.trails["roll-1"], undefined);
});

test("a rolling yarn ball pays out its thread and shrinks, then its thread fades and the ball leaves the room", () => {
  const world = buildRoom({ seed: 1, catX: 800, catY: 300 });
  const yarn = world.toys.find((toy) => toy.kind === "yarn");
  assert.ok(yarn?.kind === "yarn");
  const fullRadius = getToyRadius(yarn);
  yarn.vx = 200;
  stepFor({ world, seconds: 1 });
  assert.ok(yarn.left < 1, "no thread came off");
  assert.ok(getToyRadius(yarn) < fullRadius, "the ball did not shrink");
  const laid = world.trails["yarn-1"] ?? [];
  assert.ok(laid.length > 3, "no thread was laid");
  yarn.left = 0.001;
  yarn.vx = 200;
  stepFor({ world, seconds: 1 });
  assert.equal(yarn.left, 0);
  assert.equal(
    getToyFingers(world).some((finger) => finger.userId === "toy:yarn-1"),
    false,
    "cats still chase a used-up ball"
  );
  stepFor({ world, seconds: TOY_LIMITS.fadeSeconds });
  assert.equal(
    world.toys.some((toy) => toy.id === "yarn-1"),
    false
  );
  assert.equal(world.trails["yarn-1"], undefined);
});

test("a knocked bowl spills, and the bowl is full again once the puddle dries", () => {
  const world = buildRoom({ seed: 2, catX: 1190, catY: 770 });
  const bowl = world.toys.find((toy) => toy.kind === "bowl");
  assert.ok(bowl?.kind === "bowl");
  batUntil({ world, toyId: "bowl-1", isDone: () => bowl.spill !== undefined });
  assert.ok(bowl.spill !== undefined, "the bowl never spilled");
  stepFor({ world, seconds: TOY_LIMITS.spillSeconds + 1 });
  assert.equal(bowl.spill, undefined);
});

test("the box is a finger cats sniff but never press", () => {
  const world = buildRoom({ seed: 1, catX: 800, catY: 500 });
  const box = getToyFingers(world).find(
    (finger) => finger.userId === getToyFingerId("box-1")
  );
  assert.equal(box?.pressed, false);
});
