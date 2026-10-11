import assert from "node:assert/strict";
import { test } from "node:test";

import { getTimeOfDay } from "./get-time-of-day";
import { mixHexColors } from "./mix-hex-colors";
import { sceneConfig } from "./scene-config";

function at(hour: number) {
  return getTimeOfDay({ hour, config: sceneConfig });
}

function approximately(actual: number, expected: number, message?: string) {
  assert.ok(
    Math.abs(actual - expected) < 1e-6,
    `${message ?? ""} ${actual} ≠ ${expected}`
  );
}

test("returns each key's sky colours exactly at its hour", () => {
  for (const key of sceneConfig.sky.keys) {
    const { skyTop, skyHorizon } = at(key.hour);
    assert.deepEqual(
      { skyTop, skyHorizon },
      { skyTop: key.top, skyHorizon: key.horizon },
      `${key.hour}`
    );
  }
});

test("blends the last key back into midnight", () => {
  const midnight = sceneConfig.sky.keys[0];
  assert.equal(at(23.9999).skyTop, midnight.top);
  assert.equal(at(24).skyTop, midnight.top);
  assert.notEqual(at(22.5).skyTop, midnight.top);
  assert.notEqual(at(22.5).skyTop, sceneConfig.sky.keys.at(-1)?.top);
});

test("eases between keys instead of blending linearly", () => {
  const from = "#4f78ad";
  const to = "#6a9bd0";
  const quarterHour = 7.5 + 2.5 * 0.25;
  assert.equal(
    at(quarterHour).skyTop,
    mixHexColors({ from, to, amount: 0.15625 })
  );
  assert.notEqual(
    at(quarterHour).skyTop,
    mixHexColors({ from, to, amount: 0.25 })
  );
  assert.equal(at(8.75).skyTop, mixHexColors({ from, to, amount: 0.5 }));
});

test("wraps hours outside the day", () => {
  assert.deepEqual(at(-2), at(22));
  assert.deepEqual(at(33), at(9));
});

test("is fully night before sunrise and after sunset", () => {
  for (const hour of [0, 3, 5.75, 19.25, 22]) {
    assert.equal(at(hour).daylight, 0, `${hour}`);
    assert.equal(at(hour).nightOpacity, 1, `${hour}`);
  }
});

test("is fully day from a twilight after sunrise to a twilight before sunset", () => {
  for (const hour of [7.25, 9, 12, 17.75]) {
    assert.equal(at(hour).daylight, 1, `${hour}`);
    assert.equal(at(hour).nightOpacity, 0, `${hour}`);
  }
  assert.ok(at(6.5).daylight > 0 && at(6.5).daylight < 1);
  assert.ok(at(18.5).daylight > 0 && at(18.5).daylight < 1);
});

test("shows the sun only between sunrise and sunset, highest at midday", () => {
  assert.equal(at(5.7).sun, undefined);
  assert.equal(at(19.3).sun, undefined);
  approximately(at(5.75).sun?.progress ?? -1, 0);
  approximately(at(19.25).sun?.progress ?? -1, 1);
  approximately(at(12.5).sun?.elevation ?? -1, 1);
  assert.equal(at(12.5).sun?.color, sceneConfig.sky.sunColor);
  assert.equal(at(5.75).sun?.color, sceneConfig.sky.sunWarmColor);
});

test("keeps the lamp full at night and off through the day", () => {
  approximately(at(22).lampIntensity, sceneConfig.light.poolIntensity);
  approximately(at(3).lampIntensity, sceneConfig.light.poolIntensity);
  approximately(at(12.5).lampIntensity, 0);
  approximately(at(9).lampIntensity, 0);
  assert.ok(at(sceneConfig.sky.sunsetHour).lampIntensity > 0);
});

test("lays the daylight patch only during the day", () => {
  assert.equal(at(22).daylightPatchOpacity, 0);
  approximately(
    at(12).daylightPatchOpacity,
    sceneConfig.light.daylightPatchStrength
  );
});

test("warms the window light at sunrise and sunset and cools it at noon", () => {
  const { sky, light } = sceneConfig;
  assert.equal(at(sky.sunriseHour).daylightPatchColor, sky.sunWarmColor);
  assert.equal(at(sky.sunsetHour).daylightPatchColor, sky.sunWarmColor);
  assert.equal(at(12.5).daylightPatchColor, light.daylightColor);
  assert.notEqual(
    at(sky.sunsetHour - 0.5).daylightPatchColor,
    light.daylightColor
  );
});

test("switches the lamp on once daylight drops below lampOnDaylight", () => {
  const { sunsetHour, twilightHours } = sceneConfig.sky;
  const hours = Array.from(
    { length: 101 },
    (_, index) => sunsetHour - twilightHours + (index / 100) * twilightHours
  );
  const firstOn = hours.find((hour) => at(hour).isLampOn);
  assert.ok(firstOn !== undefined);
  assert.ok(at(firstOn).daylight < sceneConfig.light.lampOnDaylight);
  assert.ok(
    at(firstOn).lampIntensity >
      sceneConfig.light.poolIntensity * (1 - sceneConfig.light.lampOnDaylight) -
        0.05,
    "the lamp comes on at a visible level, not from zero"
  );
  assert.equal(at(firstOn - 0.1).isLampOn, false);
});
