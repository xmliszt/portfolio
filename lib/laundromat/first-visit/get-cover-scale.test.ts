import assert from "node:assert/strict";
import { test } from "node:test";

import { getCoverScale } from "./get-cover-scale";

const square = [
  { x: -10, y: -10 },
  { x: 10, y: -10 },
  { x: 10, y: 10 },
  { x: -10, y: 10 },
];

test("scales a square up until it covers a larger view", () => {
  assert.equal(
    getCoverScale({
      polygon: square,
      center: { x: 0, y: 0 },
      view: { left: 50, right: 50, top: 20, bottom: 20 },
    }),
    5
  );
});

test("does not depend on the polygon's winding", () => {
  assert.equal(
    getCoverScale({
      polygon: square.toReversed(),
      center: { x: 0, y: 0 },
      view: { left: 50, right: 50, top: 20, bottom: 20 },
    }),
    5
  );
});

test("needs more scale toward the nearer edge of an off-centre point", () => {
  assert.equal(
    getCoverScale({
      polygon: square,
      center: { x: 5, y: 0 },
      view: { left: 50, right: 50, top: 20, bottom: 20 },
    }),
    10
  );
});

test("accounts for slanted edges, like a doorway on an isometric wall", () => {
  const doorway = [
    { x: 0, y: 0 },
    { x: 20, y: -10 },
    { x: 20, y: 30 },
    { x: 0, y: 40 },
  ];
  const scale = getCoverScale({
    polygon: doorway,
    center: { x: 10, y: 15 },
    view: { left: 10, right: 10, top: 30, bottom: 30 },
  });
  assert.ok(Math.abs(scale - 1.75) < 1e-9, `got ${scale}`);
});

test("returns Infinity when the centre is outside the polygon", () => {
  assert.equal(
    getCoverScale({
      polygon: square,
      center: { x: 30, y: 0 },
      view: { left: 5, right: 5, top: 5, bottom: 5 },
    }),
    Infinity
  );
});

test("covers a view that sits off to one side of the centre", () => {
  assert.equal(
    getCoverScale({
      polygon: square,
      center: { x: 0, y: 0 },
      view: { left: 20, right: 80, top: 20, bottom: 20 },
    }),
    8
  );
});
