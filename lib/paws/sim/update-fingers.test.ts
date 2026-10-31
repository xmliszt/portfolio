import assert from "node:assert/strict";
import { test } from "node:test";

import { createWorld } from "./create-world";
import { updateFingers } from "./update-fingers";

const DT_SECONDS = 1 / 60;

test("a finger that jumps far in one step does not count as moving fast", () => {
  const world = createWorld({ random: () => 0.5 });
  updateFingers({
    world,
    inputs: [{ userId: "guest", x: 100, y: 500, pressed: false }],
    dtSeconds: DT_SECONDS,
  });
  updateFingers({
    world,
    inputs: [{ userId: "guest", x: 500, y: 500, pressed: false }],
    dtSeconds: DT_SECONDS,
  });
  assert.equal(world.fingers.guest?.speed, 0);
  assert.equal(world.fingers.guest?.x, 500);
});

test("a finger that moves a short way in one step counts as moving", () => {
  const world = createWorld({ random: () => 0.5 });
  updateFingers({
    world,
    inputs: [{ userId: "guest", x: 100, y: 500, pressed: false }],
    dtSeconds: DT_SECONDS,
  });
  updateFingers({
    world,
    inputs: [{ userId: "guest", x: 200, y: 500, pressed: false }],
    dtSeconds: DT_SECONDS,
  });
  assert.ok((world.fingers.guest?.speed ?? 0) > 500);
});

test("a step marked as jumped does not count as moving", () => {
  const world = createWorld({ random: () => 0.5 });
  updateFingers({
    world,
    inputs: [{ userId: "guest", x: 100, y: 500, pressed: false }],
    dtSeconds: DT_SECONDS,
  });
  updateFingers({
    world,
    inputs: [{ userId: "guest", x: 250, y: 500, pressed: false, jumped: true }],
    dtSeconds: DT_SECONDS,
  });
  assert.equal(world.fingers.guest?.speed, 0);
});
