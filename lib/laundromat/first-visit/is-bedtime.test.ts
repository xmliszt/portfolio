import assert from "node:assert/strict";
import { test } from "node:test";

import { getTimeOfDay } from "@/lib/laundromat/get-time-of-day";
import { sceneConfig } from "@/lib/laundromat/scene-config";

import { isBedtime } from "./is-bedtime";

const { sunriseHour, sunsetHour } = sceneConfig.sky;

function atHour(hour: number) {
  return getTimeOfDay({ hour, config: sceneConfig });
}

test("it is bedtime from just after sunset until just before sunrise in a dark, closed room", () => {
  [sunsetHour + 0.01, 23, 0, 3, sunriseHour - 0.01].forEach((hour) =>
    assert.equal(
      isBedtime({
        timeOfDay: atHour(hour),
        isLampOn: false,
        isCurtainOpen: false,
      }),
      true,
      `hour ${hour}`
    )
  );
});

test("it is not bedtime while the sun is up", () => {
  [sunriseHour, 12, sunsetHour].forEach((hour) =>
    assert.equal(
      isBedtime({
        timeOfDay: atHour(hour),
        isLampOn: false,
        isCurtainOpen: false,
      }),
      false,
      `hour ${hour}`
    )
  );
});

test("the lamp on, the curtains open or an unknown hour keep you up", () => {
  const night = atHour(23);
  assert.equal(
    isBedtime({ timeOfDay: night, isLampOn: true, isCurtainOpen: false }),
    false
  );
  assert.equal(
    isBedtime({ timeOfDay: night, isLampOn: false, isCurtainOpen: true }),
    false
  );
  assert.equal(
    isBedtime({ timeOfDay: undefined, isLampOn: false, isCurtainOpen: false }),
    false
  );
});
