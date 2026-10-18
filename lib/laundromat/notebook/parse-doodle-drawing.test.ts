import assert from "node:assert/strict";
import { test } from "node:test";

import { parseDoodleDrawing } from "./parse-doodle-drawing";

test("accepts a drawing of whole half-pixel steps", () => {
  const drawing = {
    w: 396,
    strokes: [
      [120, 20, 40, 1, 2],
      [0, 10, 10],
    ],
  };
  assert.deepEqual(parseDoodleDrawing(drawing), drawing);
});

test("rejects payloads that are not drawings", () => {
  const invalid = [
    undefined,
    null,
    "doodle",
    { strokes: [[1, 2, 3]] },
    { w: 0, strokes: [[1, 2, 3]] },
    { w: 396, strokes: [] },
    { w: 396, strokes: [[1, 2]] },
    { w: 396, strokes: [[1, 2, 3, 4]] },
    { w: 396, strokes: [[1, 2.5, 3]] },
    { w: 396, strokes: [[1, 2, 3], "x"] },
  ];
  for (const value of invalid) {
    assert.equal(parseDoodleDrawing(value), undefined);
  }
});

test("rejects drawings past the stroke limit", () => {
  const strokes = Array.from({ length: 401 }, () => [0, 1, 1]);
  assert.equal(parseDoodleDrawing({ w: 396, strokes }), undefined);
});
