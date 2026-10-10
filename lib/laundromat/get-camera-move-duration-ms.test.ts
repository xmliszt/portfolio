import assert from "node:assert/strict";
import { test } from "node:test";

import { getCameraMoveDurationMs } from "./get-camera-move-duration-ms";
import { sceneConfig } from "./scene-config";

const viewport = { width: 1280, height: 800 };
const room = { x: 0, y: 0, scale: 1 };

test("takes the near duration when the camera does not move", () => {
  assert.equal(
    getCameraMoveDurationMs({
      from: room,
      to: room,
      viewport,
      config: sceneConfig,
    }),
    500
  );
});

test("takes the far duration for a full zoom", () => {
  const zoomed = { x: 0, y: 0, scale: sceneConfig.camera.maxFocusZoom };
  assert.equal(
    getCameraMoveDurationMs({
      from: room,
      to: zoomed,
      viewport,
      config: sceneConfig,
    }),
    800
  );
});

test("takes a duration in between for a short pan", () => {
  const panned = { x: -200, y: 0, scale: 1 };
  const duration = getCameraMoveDurationMs({
    from: room,
    to: panned,
    viewport,
    config: sceneConfig,
  });
  assert.ok(duration > 500 && duration < 800, String(duration));
});
