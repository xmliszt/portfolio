import assert from "node:assert/strict";
import { test } from "node:test";

import { getBoxFaces } from "@/lib/laundromat/get-box-faces";

import { getBoardFrame } from "./get-board-frame";

const placement = {
  position: { x: 2, y: 3, z: 0 },
  size: { w: 1.5, d: 1.5, h: 3.4 },
  projection: { unit: 40, origin: { x: 400, y: 320 } },
};

function bounds(points: { x: number; y: number }[]) {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  return {
    left: Math.min(...xs),
    right: Math.max(...xs),
    top: Math.min(...ys),
    bottom: Math.max(...ys),
  };
}

test("keeps the panel and both legs inside the object's projected box", () => {
  const frame = getBoardFrame({ ...placement, leanDeg: 8 });
  const box = bounds(getBoxFaces(placement).outline);
  const parts = bounds([
    ...frame.panel.front,
    ...frame.panel.side,
    ...frame.panel.top,
    ...[...frame.rearRails, ...frame.frontRails].flatMap(({ from, to }) => [
      from,
      to,
    ]),
  ]);
  assert.ok(parts.left >= box.left - 0.01, "left");
  assert.ok(parts.right <= box.right + 0.01, "right");
  assert.ok(parts.top >= box.top - 0.01, "top");
  assert.ok(parts.bottom <= box.bottom + 0.01, "bottom");
});

test("puts the hinges on the rear edge of the panel top", () => {
  const frame = getBoardFrame({ ...placement, leanDeg: 8 });
  const [, backLeft, backRight] = frame.panel.top;
  const edge = { x: backRight.x - backLeft.x, y: backRight.y - backLeft.y };
  const length = Math.hypot(edge.x, edge.y);
  for (const point of frame.hinges.flatMap(({ from, to }) => [from, to])) {
    const offsetPx =
      Math.abs(
        edge.x * (point.y - backLeft.y) - edge.y * (point.x - backLeft.x)
      ) / length;
    assert.ok(
      offsetPx < 0.5,
      `hinge ${point.x},${point.y} is ${offsetPx}px off the rear edge`
    );
  }
});

test("leans the panel top back as `leanDeg` grows", () => {
  const upright = getBoardFrame({ ...placement, leanDeg: 0 });
  const leaning = getBoardFrame({ ...placement, leanDeg: 12 });
  assert.ok(leaning.panel.front[0].x > upright.panel.front[0].x);
});
