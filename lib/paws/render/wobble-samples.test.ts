import assert from "node:assert/strict";
import { test } from "node:test";

import type { Vec4 } from "@/lib/paws/sim/cat-poses";

import { wobbleSamples } from "./wobble-samples";

const line = (options: { dx: number; dy: number }): Vec4[] =>
  Array.from({ length: 9 }, (_, i) => [
    i * 10 + options.dx,
    options.dy,
    20,
    5,
  ]);

test("a moved run keeps the same wobble, so shapes hold still while a cat moves", () => {
  const here = wobbleSamples({
    samples: line({ dx: 0, dy: 0 }),
    seed: 4.2,
    amount: 0.07,
    bumps: 3,
  });
  const there = wobbleSamples({
    samples: line({ dx: 130, dy: -40 }),
    seed: 4.2,
    amount: 0.07,
    bumps: 3,
  });
  here.forEach((point, i) => {
    assert.ok(Math.abs(point[2] - there[i][2]) < 1e-9, `radius ${i}`);
    assert.ok(Math.abs(point[1] - (there[i][1] + 40)) < 1e-9, `shift ${i}`);
  });
});

test("the wobble stays within `amount` of each radius", () => {
  const wobbled = wobbleSamples({
    samples: line({ dx: 0, dy: 0 }),
    seed: 9.1,
    amount: 0.07,
    bumps: 3,
  });
  for (const [, , r] of wobbled) assert.ok(Math.abs(r - 20) <= 20 * 0.07);
});
