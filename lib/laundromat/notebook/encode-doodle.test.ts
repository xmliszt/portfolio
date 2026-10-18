import assert from "node:assert/strict";
import { test } from "node:test";

import { decodeDoodle } from "./decode-doodle";
import { encodeDoodle } from "./encode-doodle";

test("stores each stroke as its duration and half-pixel steps from the previous point", () => {
  const drawing = encodeDoodle({
    widthPx: 396,
    strokes: [
      {
        durationMs: 120.4,
        points: [
          [10, 20],
          [10.5, 21],
          [12, 18.2],
        ],
      },
      { durationMs: 0, points: [[5, 5]] },
    ],
  });
  assert.deepEqual(drawing, {
    w: 396,
    strokes: [
      [120, 20, 40, 1, 2, 3, -6],
      [0, 10, 10],
    ],
  });
});

test("decodes back to the half-pixel-rounded points", () => {
  const strokes = [
    {
      durationMs: 300,
      points: [
        [1.2, 3.9],
        [100, 60.26],
      ] satisfies [number, number][],
    },
  ];
  const decoded = decodeDoodle({
    drawing: encodeDoodle({ strokes, widthPx: 396 }),
    widthPx: 396,
  });
  assert.deepEqual(decoded, [
    {
      durationMs: 300,
      points: [
        [1, 4],
        [100, 60.5],
      ],
    },
  ]);
});
