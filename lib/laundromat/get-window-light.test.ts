import assert from "node:assert/strict";
import { test } from "node:test";

import { getStreetLight } from "./get-street-light";
import { getTimeOfDay } from "./get-time-of-day";
import { getWindowLight } from "./get-window-light";
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
    light: getWindowLight({ window, timeOfDay, config }),
  };
}

test("uses the daylight patch colour and opacity by day", () => {
  const { timeOfDay, light } = lightAt({ hour: 12 });
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
  const { timeOfDay, light } = lightAt({ hour: 1 });
  const street = getStreetLight({ timeOfDay, sky: sceneConfig.sky });
  assert.equal(light?.color, sceneConfig.sky.moonColor);
  assert.equal(light?.opacity, street.strength * 0.5);
});

test("returns nothing when the building across the street shades the whole window", () => {
  const { light } = lightAt({
    hour: 12,
    config: {
      ...sceneConfig,
      street: { oppositeDistance: 1, oppositeHeight: 50 },
    },
  });
  assert.equal(light, undefined);
});
