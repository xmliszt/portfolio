import assert from "node:assert/strict";
import { test } from "node:test";

import { getStreetLights } from "./get-street-lights";
import { getTimeOfDay } from "./get-time-of-day";
import { sceneConfig } from "./scene-config";

function lightsAt(options: { hour: number }) {
  const [sun, moon] = getStreetLights({
    timeOfDay: getTimeOfDay({ hour: options.hour, config: sceneConfig }),
    sky: sceneConfig.sky,
  });
  return { sun: sun!, moon: moon! };
}

test("casts shadows toward the room, shortest at noon", () => {
  const noon = lightsAt({ hour: 12.5 }).sun;
  const evening = lightsAt({ hour: 18 }).sun;
  assert.ok(noon.shadow.x > 0, "shadows fall toward the window wall");
  assert.ok(evening.shadow.x > noon.shadow.x, "longer at a low sun");
});

test("slants one way in the morning and the other in the evening, like the daylight patch", () => {
  assert.ok(
    lightsAt({ hour: 8 }).sun.shadow.y < 0,
    "morning slants toward the back wall"
  );
  assert.ok(
    lightsAt({ hour: 17 }).sun.shadow.y > 0,
    "evening slants toward the front"
  );
});

test("uses the warm sun near sunset and the faint moon at night", () => {
  const sunset = lightsAt({ hour: 19 }).sun;
  const night = lightsAt({ hour: 1 }).moon;
  assert.notEqual(sunset.color, sceneConfig.sky.sunColor);
  assert.equal(night.color, sceneConfig.sky.moonColor);
  assert.ok(night.strength < 0.5, "moonlight is fainter than daylight");
});

test("fades the moon in slowly from nothing after sunset", () => {
  const { sunsetHour } = sceneConfig.sky;
  const strengths = Array.from(
    { length: 61 },
    (_, step) =>
      lightsAt({ hour: sunsetHour + 0.01 + step * 0.05 }).moon.strength
  );
  assert.ok(strengths[0]! < 0.001, `just after sunset ${strengths[0]}`);
  strengths.slice(1).forEach((strength, index) => {
    const step = strength - strengths[index]!;
    assert.ok(step >= 0 && step < 0.01, `step ${step} at ${index}`);
  });
});

test("keeps the sun pointing where it set while it fades out", () => {
  const { sunsetHour } = sceneConfig.sky;
  const before = lightsAt({ hour: sunsetHour - 0.02 }).sun;
  const after = lightsAt({ hour: sunsetHour + 0.5 }).sun;
  assert.ok(Math.abs(after.shadow.y - before.shadow.y) < 0.5);
  assert.equal(Math.sign(after.shadow.y), Math.sign(before.shadow.y));
  assert.equal(after.strength, 0);
});
