import assert from "node:assert/strict";
import { test } from "node:test";

import { createSeededRandom } from "@/lib/paws/sim/create-seeded-random";
import { buildLook } from "@/lib/paws/sim/testing/build-look";
import { buildSnapshot } from "@/lib/paws/sim/testing/build-snapshot";
import type { CatSnapshot } from "@/lib/paws/wire-types";

import { createLegPlayer } from "./create-leg-player";

const DT_SECONDS = 1 / 60;
const SPEED = 400;

function runningCat(options: {
  t: number;
  activity?: CatSnapshot["activity"];
}) {
  const still = buildSnapshot({ userId: "cat", x: 200, y: 500 });
  return {
    ...buildSnapshot({
      userId: "cat",
      x: 200 + SPEED * options.t,
      y: 500,
      activity: options.activity,
    }),
    speed: SPEED,
    legs: still.legs,
  };
}

function play(options: { activity?: CatSnapshot["activity"] }) {
  const player = createLegPlayer({ random: createSeededRandom({ seed: 1 }) });
  const look = buildLook();
  return Array.from({ length: 120 }, (_, frame) =>
    player.step({
      snapshots: [
        runningCat({ t: frame * DT_SECONDS, activity: options.activity }),
      ],
      lookOf: () => look,
      dtSeconds: DT_SECONDS,
    })
  );
}

test("steps the legs of a moving cat on this screen and prints its footfalls", () => {
  const frames = play({});
  const last = frames.at(-1)?.snapshots.at(0);
  assert.ok(last !== undefined);
  assert.ok(
    last.legs.every((leg) => Math.abs(leg.x - last.x) < 150),
    "the paws keep up with the body"
  );
  assert.ok(
    frames.flatMap((frame) => frame.prints).length > 4,
    "prints footfalls"
  );
});

test("keeps the host's legs while a still cat reaches with a paw", () => {
  const player = createLegPlayer({ random: createSeededRandom({ seed: 1 }) });
  const look = buildLook();
  const still = buildSnapshot({
    userId: "cat",
    x: 500,
    y: 500,
    activity: "paw",
  });
  const reaching: CatSnapshot = {
    ...still,
    legs: [
      { x: still.x + 80, y: still.y, h: 8 },
      still.legs[1],
      still.legs[2],
      still.legs[3],
    ],
  };
  const frames = Array.from({ length: 60 }, () =>
    player.step({
      snapshots: [reaching],
      lookOf: () => look,
      dtSeconds: DT_SECONDS,
    })
  );
  const leg = frames.at(-1)?.snapshots.at(0)?.legs[0];
  assert.ok(leg !== undefined);
  assert.ok(Math.abs(leg.x - (still.x + 80)) < 1, "follows the host's paw");
  assert.equal(frames.flatMap((frame) => frame.prints).length, 0);
  assert.ok(frames.at(-1)?.hostLegIds.has("cat"));
});

test("starts a cat's legs from its body again after a reset", () => {
  const player = createLegPlayer({ random: createSeededRandom({ seed: 1 }) });
  const look = buildLook();
  const lookOf = () => look;
  player.step({
    snapshots: [buildSnapshot({ userId: "cat", x: 500, y: 500 })],
    lookOf,
    dtSeconds: DT_SECONDS,
  });
  player.reset();
  const moved = buildSnapshot({ userId: "cat", x: 650, y: 500 });
  const stepped = player.step({
    snapshots: [moved],
    lookOf,
    dtSeconds: DT_SECONDS,
  });
  assert.deepEqual(stepped.snapshots.at(0)?.legs, moved.legs);
  assert.equal(stepped.prints.length, 0);
});

test("steps the legs of a cat that walks to reposition while pawing", () => {
  const frames = play({ activity: "paw" }).map((frame) => frame.prints);
  assert.ok(frames.flat().length > 4);
});
