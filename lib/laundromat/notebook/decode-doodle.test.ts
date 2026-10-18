import assert from "node:assert/strict";
import { test } from "node:test";

import { decodeDoodle } from "./decode-doodle";

test("scales a doodle drawn at another width to `widthPx`", () => {
  assert.deepEqual(
    decodeDoodle({
      drawing: { w: 200, strokes: [[50, 40, 20, 4, 0]] },
      widthPx: 400,
    }),
    [
      {
        durationMs: 50,
        points: [
          [40, 20],
          [44, 20],
        ],
      },
    ]
  );
});
