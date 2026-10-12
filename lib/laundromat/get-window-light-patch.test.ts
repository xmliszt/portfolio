import assert from "node:assert/strict";
import { test } from "node:test";

import { getWindowLightPatch } from "./get-window-light-patch";

test("projects the window onto the floor along the light", () => {
  const patch = getWindowLightPatch({
    opening: { wallX: 0, fromY: 6, toY: 9, bottom: 2.5, top: 5.5 },
    shadow: { x: 1, y: 0.5 },
    floor: { width: 14, depth: 20 },
  });
  assert.deepEqual(patch, [
    { x: 2.5, y: 7.25 },
    { x: 2.5, y: 10.25 },
    { x: 5.5, y: 11.75 },
    { x: 5.5, y: 8.75 },
  ]);
});
