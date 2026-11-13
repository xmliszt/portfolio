import assert from "node:assert/strict";
import { test } from "node:test";

import { clipConvexPolygon } from "./clip-convex-polygon";
import { getConvexHull } from "./get-convex-hull";

const square = [
  { x: 0, y: 0 },
  { x: 10, y: 0 },
  { x: 10, y: 10 },
  { x: 0, y: 10 },
];

test("clipConvexPolygon keeps only the overlap, whichever way the clip polygon winds", () => {
  const subject = [
    { x: 5, y: 5 },
    { x: 15, y: 5 },
    { x: 15, y: 15 },
    { x: 5, y: 15 },
  ];
  for (const clip of [square, square.toReversed()]) {
    const xs = clipConvexPolygon({ subject, clip }).map((point) => point.x);
    const ys = clipConvexPolygon({ subject, clip }).map((point) => point.y);
    assert.deepEqual(
      [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)],
      [5, 10, 5, 10]
    );
  }
});

test("clipConvexPolygon returns nothing when the polygons do not overlap", () => {
  const subject = square.map((point) => ({ x: point.x + 20, y: point.y }));
  assert.deepEqual(clipConvexPolygon({ subject, clip: square }), []);
});

test("getConvexHull drops the points inside the hull", () => {
  const hull = getConvexHull([...square, { x: 5, y: 5 }, { x: 2, y: 8 }]);
  assert.equal(hull.length, 4);
  assert.ok(
    hull.every((point) =>
      square.some((corner) => corner.x === point.x && corner.y === point.y)
    )
  );
});
