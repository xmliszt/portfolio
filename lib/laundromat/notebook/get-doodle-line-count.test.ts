import assert from "node:assert/strict";
import { test } from "node:test";

import { getDoodleLineCount } from "./get-doodle-line-count";

const pen = { pitchPx: 30, strokeWidthPx: 2, maxRows: 6 };

test("counts the rows down to the lowest point plus the timestamp line", () => {
  const strokes = [
    {
      durationMs: 0,
      points: [
        [0, 10],
        [50, 70],
      ] satisfies [number, number][],
    },
  ];
  assert.equal(getDoodleLineCount({ ...pen, strokes }), 4);
});

test("takes at least one row and at most `maxRows`", () => {
  assert.equal(
    getDoodleLineCount({
      ...pen,
      strokes: [{ durationMs: 0, points: [[0, 0]] }],
    }),
    2
  );
  assert.equal(
    getDoodleLineCount({
      ...pen,
      strokes: [{ durationMs: 0, points: [[0, 900]] }],
    }),
    7
  );
});
