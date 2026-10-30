import assert from "node:assert/strict";
import { test } from "node:test";

import { ROOM_LIMITS } from "@/lib/paws/room-limits";

import { getWorldView } from "./get-world-view";

const { worldWidth, worldHeight } = ROOM_LIMITS;

test("a wide screen shows the whole world, centered", () => {
  const view = getWorldView({ width: 2000, height: 1000, centerX: 0 });
  assert.deepEqual(view, { scale: 1, offsetX: 200, offsetY: 0 });
});

test("a phone shows the world at full height around the center it is given", () => {
  const view = getWorldView({ width: 400, height: 1000, centerX: 800 });
  assert.equal(view.scale, 1000 / worldHeight);
  assert.equal(view.offsetX, 200 - 800);
});

test("a phone stops at the world's left and right edges", () => {
  assert.equal(
    getWorldView({ width: 400, height: 1000, centerX: -500 }).offsetX,
    0
  );
  assert.equal(
    getWorldView({ width: 400, height: 1000, centerX: worldWidth + 500 })
      .offsetX,
    400 - worldWidth
  );
});
