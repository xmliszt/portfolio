import assert from "node:assert/strict";
import { test } from "node:test";

import { getTimeOfDay } from "@/lib/laundromat/get-time-of-day";
import { sceneConfig } from "@/lib/laundromat/scene-config";

import { getBedroomWindowLight } from "./get-bedroom-window-light";

function at(hour: number) {
  return getBedroomWindowLight({
    timeOfDay: getTimeOfDay({ hour, config: sceneConfig }),
    sky: sceneConfig.sky,
  });
}

test("lets moonlight in at night, dimmer than daylight", () => {
  const night = at(1);
  const noon = at(12);
  assert.equal(night.color, sceneConfig.sky.moonColor);
  assert.ok(night.strength > 0, `night strength ${night.strength}`);
  assert.ok(night.strength < noon.strength / 2);
});

test("uses the room's daylight colour and strength while the sun is up", () => {
  const timeOfDay = getTimeOfDay({ hour: 12, config: sceneConfig });
  const noon = getBedroomWindowLight({ timeOfDay, sky: sceneConfig.sky });
  assert.equal(noon.color, timeOfDay.daylightPatchColor);
  assert.equal(noon.strength, timeOfDay.daylight);
  assert.equal(noon.sources[0].sun.progress, timeOfDay.sun?.progress);
});

test("keeps the sun pointing the same way as it fades out, with the moon still dark", () => {
  const { sunsetHour } = sceneConfig.sky;
  const [before, after] = [sunsetHour - 0.05, sunsetHour + 0.05].map((hour) =>
    getBedroomWindowLight({
      timeOfDay: getTimeOfDay({ hour, config: sceneConfig }),
      sky: sceneConfig.sky,
    })
  );
  const [sunBefore, moonBefore] = before!.sources;
  const [sunAfter, moonAfter] = after!.sources;
  assert.ok(Math.abs(sunAfter.sun.progress - sunBefore.sun.progress) < 0.01);
  assert.ok(moonBefore.strength === 0 && moonAfter.strength < 0.001);
  assert.ok(sunAfter.sun.elevation < 0.02 && sunBefore.sun.elevation < 0.02);
});
