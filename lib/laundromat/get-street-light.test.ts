import assert from "node:assert/strict";
import { test } from "node:test";

import { getStreetLight } from "./get-street-light";
import { getTimeOfDay } from "./get-time-of-day";
import { sceneConfig } from "./scene-config";

function lightAt(options: { hour: number }) {
  return getStreetLight({
    timeOfDay: getTimeOfDay({ hour: options.hour, config: sceneConfig }),
    sky: sceneConfig.sky,
  });
}

test("casts shadows toward the room, shortest at noon", () => {
  const noon = lightAt({ hour: 12.5 });
  const evening = lightAt({ hour: 18 });
  assert.ok(noon.shadow.x > 0, "shadows fall toward the window wall");
  assert.ok(evening.shadow.x > noon.shadow.x, "longer at a low sun");
});

test("slants one way in the morning and the other in the evening, like the daylight patch", () => {
  assert.ok(
    lightAt({ hour: 8 }).shadow.y < 0,
    "morning slants toward the back wall"
  );
  assert.ok(
    lightAt({ hour: 17 }).shadow.y > 0,
    "evening slants toward the front"
  );
});

test("uses the warm sun near sunset and the faint moon at night", () => {
  const sunset = lightAt({ hour: 19 });
  const night = lightAt({ hour: 1 });
  assert.notEqual(sunset.color, sceneConfig.sky.sunColor);
  assert.equal(night.color, sceneConfig.sky.moonColor);
  assert.ok(night.strength < 0.5, "moonlight is fainter than daylight");
});
