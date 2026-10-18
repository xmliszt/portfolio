import assert from "node:assert/strict";
import { test } from "node:test";

import { simplifyStroke } from "./simplify-stroke";

test("drops points that lie on a straight line", () => {
  assert.deepEqual(
    simplifyStroke({
      points: [
        [0, 0],
        [1, 0.1],
        [2, 0],
        [3, 0.05],
        [4, 0],
      ],
      tolerancePx: 0.5,
    }),
    [
      [0, 0],
      [4, 0],
    ]
  );
});

test("keeps the corner of a bend", () => {
  assert.deepEqual(
    simplifyStroke({
      points: [
        [0, 0],
        [5, 0],
        [10, 0],
        [10, 5],
        [10, 10],
      ],
      tolerancePx: 0.5,
    }),
    [
      [0, 0],
      [10, 0],
      [10, 10],
    ]
  );
});

test("leaves dots and two-point strokes alone", () => {
  assert.deepEqual(simplifyStroke({ points: [[3, 3]], tolerancePx: 1 }), [
    [3, 3],
  ]);
  assert.deepEqual(
    simplifyStroke({
      points: [
        [0, 0],
        [1, 1],
      ],
      tolerancePx: 1,
    }),
    [
      [0, 0],
      [1, 1],
    ]
  );
});
