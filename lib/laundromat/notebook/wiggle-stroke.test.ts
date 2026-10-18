import assert from "node:assert/strict";
import { test } from "node:test";

import { wiggleStroke } from "./wiggle-stroke";

const stroke = {
  durationMs: 120,
  points: [
    [10, 10],
    [20, 12],
    [30, 18],
  ] satisfies [number, number][],
};

test("gives the same points for the same frame", () => {
  const options = { stroke, strokeIndex: 0, frame: 1, amplitudePx: 1 };
  assert.deepEqual(wiggleStroke(options), wiggleStroke(options));
});

test("moves each point by at most `amplitudePx`", () => {
  for (const frame of [0, 1, 2]) {
    const wiggled = wiggleStroke({
      stroke,
      strokeIndex: 3,
      frame,
      amplitudePx: 0.8,
    });
    wiggled.points.forEach(([x, y], index) => {
      const [fromX, fromY] = stroke.points[index];
      assert.ok(Math.hypot(x - fromX, y - fromY) <= 0.8 + 1e-9);
    });
  }
});

test("moves the points differently from one frame to the next", () => {
  const first = wiggleStroke({
    stroke,
    strokeIndex: 0,
    frame: 0,
    amplitudePx: 1,
  });
  const second = wiggleStroke({
    stroke,
    strokeIndex: 0,
    frame: 1,
    amplitudePx: 1,
  });
  assert.notDeepEqual(first.points, second.points);
});

test("moves two strokes' first points in different directions", () => {
  const first = wiggleStroke({
    stroke,
    strokeIndex: 0,
    frame: 0,
    amplitudePx: 1,
  });
  const second = wiggleStroke({
    stroke,
    strokeIndex: 1,
    frame: 0,
    amplitudePx: 1,
  });
  assert.notDeepEqual(first.points[0], second.points[0]);
});
