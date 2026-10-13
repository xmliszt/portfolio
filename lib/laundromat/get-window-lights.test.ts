import assert from "node:assert/strict";
import { test } from "node:test";

import { getStreetLights } from "./get-street-lights";
import { getTimeOfDay } from "./get-time-of-day";
import { getWindowLights } from "./get-window-lights";
import type { SceneObject } from "./scene-config";
import { sceneConfig } from "./scene-config";

const window = {
  id: "window",
  kind: "window",
  position: { x: 0, y: 6, z: 2 },
  size: { w: 0.3, d: 3, h: 3 },
} satisfies SceneObject;

function lightAt(options: { hour: number; config?: typeof sceneConfig }) {
  const config = options.config ?? sceneConfig;
  const timeOfDay = getTimeOfDay({ hour: options.hour, config });
  return {
    timeOfDay,
    lights: getWindowLights({ window, timeOfDay, config }),
  };
}

test("uses the daylight patch colour and opacity by day", () => {
  const { timeOfDay, lights } = lightAt({ hour: 12 });
  const light = lights.find(({ key }) => key === "sun");
  assert.equal(light?.color, timeOfDay.daylightPatchColor);
  assert.equal(light?.opacity, timeOfDay.daylightPatchOpacity);
  assert.deepEqual(light?.opening, {
    wallX: 0,
    fromY: 6,
    toY: 9,
    bottom: 2,
    top: 5,
  });
});

test("uses the moon colour at half the street light's strength by night", () => {
  const { timeOfDay, lights } = lightAt({ hour: 1 });
  const moon = getStreetLights({ timeOfDay, sky: sceneConfig.sky }).find(
    ({ key }) => key === "moon"
  );
  const light = lights.find(({ key }) => key === "moon");
  assert.equal(light?.color, sceneConfig.sky.moonColor);
  assert.equal(light?.opacity, (moon?.strength ?? 0) * 0.5);
});

test("returns nothing when the building across the street shades the whole window", () => {
  const { lights } = lightAt({
    hour: 12,
    config: {
      ...sceneConfig,
      street: { oppositeDistance: 1, oppositeHeight: 50 },
    },
  });
  assert.equal(
    lights.find(({ key }) => key === "sun"),
    undefined
  );
});
