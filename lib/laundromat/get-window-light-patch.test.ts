import assert from "node:assert/strict";
import { test } from "node:test";

import { getWindowLightPatch } from "./get-window-light-patch";

const window = {
  wallX: 0,
  fromY: 6,
  toY: 9,
  bottom: 2.5,
  top: 5.5,
  street: { oppositeDistance: 12, oppositeHeight: 5.5 },
  floor: { width: 14, depth: 20 },
};

test("projects the window onto the floor along the light", () => {
  const patch = getWindowLightPatch({ ...window, shadow: { x: 1, y: 0.5 } });
  assert.deepEqual(patch, [
    { x: 2.5, y: 7.25 },
    { x: 2.5, y: 10.25 },
    { x: 5.5, y: 11.75 },
    { x: 5.5, y: 8.75 },
  ]);
});

test("starts higher on the window when the building across the street shades its bottom", () => {
  const patch = getWindowLightPatch({
    ...window,
    floor: { width: 30, depth: 20 },
    shadow: { x: 6, y: 0 },
  });
  assert.equal(patch?.[0].x, 21, "lit from the shade line at 3.5, not 2.5");
});

test("returns nothing when the building shades the whole window", () => {
  const patch = getWindowLightPatch({
    ...window,
    street: { oppositeDistance: 12, oppositeHeight: 9 },
    shadow: { x: 6, y: 0 },
  });
  assert.equal(patch, undefined);
});
