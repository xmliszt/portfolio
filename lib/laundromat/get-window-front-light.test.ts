import assert from "node:assert/strict";
import { test } from "node:test";

import { getWindowFrontLight } from "./get-window-front-light";

const opening = { wallX: 0, fromY: 6, toY: 9, bottom: 2.5, top: 5.5 };

test("projects the window onto a front face along the light", () => {
  const light = getWindowFrontLight({
    opening,
    shadow: { x: 2, y: -1 },
    frontY: 2,
  });
  assert.deepEqual(light, [
    { x: 8, y: 2, z: -1.5 },
    { x: 14, y: 2, z: -4.5 },
    { x: 14, y: 2, z: -1.5 },
    { x: 8, y: 2, z: 1.5 },
  ]);
});

test("returns nothing when the light moves away from the front face", () => {
  assert.equal(
    getWindowFrontLight({ opening, shadow: { x: 2, y: 0.5 }, frontY: 2 }),
    undefined
  );
});
