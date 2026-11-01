import assert from "node:assert/strict";
import { test } from "node:test";

import { deriveCat } from "@/lib/paws/sim/derive-cat";
import { buildLook } from "@/lib/paws/sim/testing/build-look";
import { buildSnapshot } from "@/lib/paws/sim/testing/build-snapshot";
import type { CatSnapshot, ToySnapshot } from "@/lib/paws/wire-types";

import { createToyMarks } from "./create-toy-marks";

const place = { h: 0, angle: 0, spin: 0 };

function catWithFrontPaw(options: { x: number; y: number; h: number }) {
  const snapshot = buildSnapshot({
    userId: "a",
    x: options.x - 60,
    y: options.y,
  });
  const legs: CatSnapshot["legs"] = [
    { x: options.x, y: options.y, h: options.h },
    snapshot.legs[1],
    snapshot.legs[2],
    snapshot.legs[3],
  ];
  return deriveCat({
    snapshot: { ...snapshot, legs },
    look: buildLook(),
    time: 0,
  });
}

test("a paw that lands in the puddle leaves wet prints outside it", () => {
  const marks = createToyMarks();
  const toys: ToySnapshot[] = [
    {
      ...place,
      kind: "bowl",
      id: "bowl",
      x: 400,
      y: 400,
      spill: { x: 500, y: 500, seconds: 20 },
    },
  ];
  const stepAt = (options: { x: number; h: number; time: number }) =>
    marks.step({
      toys,
      cats: [catWithFrontPaw({ x: options.x, y: 500, h: options.h })],
      time: options.time,
    });
  stepAt({ x: 500, h: 3, time: 0 });
  const inWater = stepAt({ x: 500, h: 0, time: 0.1 });
  assert.equal(inWater.ripples.length, 1);
  assert.equal(inWater.wetPrints.length, 0);
  stepAt({ x: 800, h: 3, time: 0.5 });
  const outside = stepAt({ x: 800, h: 0, time: 0.6 });
  assert.equal(outside.wetPrints.length, 1);
});

test("a paw landing in the second bowl's puddle ripples too", () => {
  const marks = createToyMarks();
  const bowlAt = (options: { id: string; x: number }): ToySnapshot => ({
    ...place,
    kind: "bowl",
    id: options.id,
    x: options.x,
    y: 400,
    spill: { x: options.x, y: 500, seconds: 20 },
  });
  const toys = [
    bowlAt({ id: "bowl-1", x: 200 }),
    bowlAt({ id: "bowl-2", x: 900 }),
  ];
  marks.step({
    toys,
    cats: [catWithFrontPaw({ x: 900, y: 500, h: 3 })],
    time: 0,
  });
  const landed = marks.step({
    toys,
    cats: [catWithFrontPaw({ x: 900, y: 500, h: 0 })],
    time: 0.1,
  });
  assert.equal(landed.ripples.length, 1);
});
