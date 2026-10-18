import assert from "node:assert/strict";
import { test } from "node:test";

import { DOODLE_LIMITS } from "./doodle-limits";
import { getDoodleArea } from "./get-doodle-area";
import { parseDoodleDrawing } from "./parse-doodle-drawing";

const { widthPx, heightPx } = getDoodleArea();

test("accepts a drawing of whole half-pixel steps inside the drawing space", () => {
  const drawing = {
    w: widthPx,
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
    { w: 1, strokes: [[1, 2, 3]] },
    { w: widthPx, strokes: [] },
    { w: widthPx, strokes: [[1, 2]] },
    { w: widthPx, strokes: [[1, 2, 3, 4]] },
    { w: widthPx, strokes: [[1, 2.5, 3]] },
    { w: widthPx, strokes: [[1, 2, 3], "x"] },
  ];
  for (const value of invalid) {
    assert.equal(parseDoodleDrawing(value), undefined, JSON.stringify(value));
  }
});

test("accepts points on the edge of the drawing space", () => {
  const drawing = {
    w: widthPx,
    strokes: [[0, widthPx * 2, Math.ceil(heightPx * 2)]],
  };
  assert.deepEqual(parseDoodleDrawing(drawing), drawing);
});

test("rejects points outside the drawing space and bad durations", () => {
  const outside = [
    [-1, 0, 0],
    [0, widthPx * 2 + 1, 0],
    [0, 0, Math.ceil(heightPx * 2) + 1],
    [0, 10, 10, -11, 0],
    [DOODLE_LIMITS.maxStrokeMs + 1, 0, 0],
  ];
  for (const stroke of outside) {
    assert.equal(
      parseDoodleDrawing({ w: widthPx, strokes: [stroke] }),
      undefined,
      JSON.stringify(stroke)
    );
  }
});

test("rejects drawings past the stroke limit", () => {
  const strokes = Array.from({ length: DOODLE_LIMITS.maxStrokes + 1 }, () => [
    0, 1, 1,
  ]);
  assert.equal(parseDoodleDrawing({ w: widthPx, strokes }), undefined);
});
