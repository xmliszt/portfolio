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

test("keeps the lamp full at night and dims it to the noon ratio at midday", () => {
  approximately(at(22).lampIntensity, sceneConfig.light.poolIntensity);
  approximately(at(3).lampIntensity, sceneConfig.light.poolIntensity);
  approximately(
    at(12.5).lampIntensity,
    sceneConfig.light.poolIntensity * sceneConfig.light.lampNoonRatio
  );
  assert.ok(at(9).lampIntensity < at(22).lampIntensity);
});

test("lays the daylight patch only during the day", () => {
  assert.equal(at(22).daylightPatchOpacity, 0);
  approximately(
    at(12).daylightPatchOpacity,
    sceneConfig.light.daylightPatchStrength
  );
});
