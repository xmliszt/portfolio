import assert from "node:assert/strict";
import { test } from "node:test";

import { getStartingViewfinder } from "./get-starting-viewfinder";
import { resizeViewfinder } from "./resize-viewfinder";
import { scaleViewfinder } from "./scale-viewfinder";
import { sizeViewfinder } from "./size-viewfinder";
import { turnViewfinder } from "./turn-viewfinder";

const viewport = { width: 1440, height: 900 };
const minShortPx = 96;

test("grows a landscape or portrait frame to the full screen height", () => {
  assert.deepEqual(
    sizeViewfinder({
      orientation: "landscape",
      width: 5000,
      viewport,
      minShortPx,
    }),
    { width: 1200, height: 900 }
  );
  assert.deepEqual(
    sizeViewfinder({
      orientation: "portrait",
      width: 5000,
      viewport,
      minShortPx,
    }),
    { width: 675, height: 900 }
  );
});

test("grows a landscape frame to the full width on a tall screen", () => {
  const phone = { width: 390, height: 844 };
  assert.deepEqual(
    sizeViewfinder({
      orientation: "landscape",
      width: 5000,
      viewport: phone,
      minShortPx,
    }),
    { width: 390, height: 292.5 }
  );
});

test("keeps the short side at least the minimum", () => {
  const portrait = sizeViewfinder({
    orientation: "portrait",
    width: 10,
    viewport,
    minShortPx,
  });
  const landscape = sizeViewfinder({
    orientation: "landscape",
    width: 10,
    viewport,
    minShortPx,
  });
  assert.equal(portrait.width, 96);
  assert.equal(landscape.height, 96);
});

test("opens centred", () => {
  const frame = getStartingViewfinder({
    orientation: "portrait",
    viewport,
    minShortPx,
  });
  assert.equal(frame.x + frame.width / 2, 720);
  assert.equal(frame.y + frame.height / 2, 450);
});

test("resizing from a corner keeps the opposite corner in place", () => {
  const start = { x: 400, y: 200, width: 300, height: 400 };
  const frame = resizeViewfinder({
    start,
    corner: "top-left",
    dx: -30,
    dy: 0,
    orientation: "portrait",
    viewport,
    minShortPx,
  });
  assert.equal(frame.x + frame.width, 700);
  assert.equal(frame.y + frame.height, 600);
  assert.equal(frame.width, 330);
});

test("dragging a corner inward along one axis shrinks the frame", () => {
  const start = { x: 400, y: 200, width: 300, height: 400 };
  const frame = resizeViewfinder({
    start,
    corner: "bottom-right",
    dx: -100,
    dy: 0,
    orientation: "portrait",
    viewport,
    minShortPx,
  });
  assert.equal(frame.width, 200);
  assert.equal(frame.x, 400);
  assert.equal(frame.y, 200);
});

test("resizing into an edge pushes the frame along instead of stopping it", () => {
  const start = { x: 1000, y: 100, width: 300, height: 225 };
  const frame = resizeViewfinder({
    start,
    corner: "bottom-right",
    dx: 900,
    dy: 0,
    orientation: "landscape",
    viewport,
    minShortPx,
  });
  assert.deepEqual(frame, { x: 240, y: 0, width: 1200, height: 900 });
});

test("scaling and turning keep the centre and stay on screen", () => {
  const frame = { x: 600, y: 300, width: 240, height: 320 };
  const bigger = scaleViewfinder({
    frame,
    factor: 1.5,
    orientation: "portrait",
    viewport,
    minShortPx,
  });
  assert.equal(bigger.x + bigger.width / 2, 720);
  const turned = turnViewfinder({
    frame,
    orientation: "landscape",
    viewport,
    minShortPx,
  });
  assert.equal(turned.x + turned.width / 2, 720);
  assert.ok(Math.abs(turned.width / turned.height - 4 / 3) < 1e-9);
  assert.ok(Math.abs(turned.width * turned.height - 240 * 320) < 1e-6);
});
