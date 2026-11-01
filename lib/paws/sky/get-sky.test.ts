import assert from "node:assert/strict";
import { test } from "node:test";

import { getSky } from "./get-sky";

const at = (hour: number, month = 9) => new Date(2026, month, 15, hour, 0, 0);

test("noon is sunlit and midnight is dark with the lamp on", () => {
  const noon = getSky({ date: at(12), latitude: 31.2 });
  const midnight = getSky({ date: at(0), latitude: 31.2 });
  assert.ok(noon.sunElevation > 40);
  assert.ok(noon.sunlight > 0.9 && noon.lamp === 0);
  assert.equal(noon.light.darkAlpha, 0);
  assert.ok(midnight.sunElevation < -18);
  assert.ok(midnight.lamp === 1 && midnight.sunlight === 0);
  assert.ok(midnight.light.darkAlpha > 0.5);
});

test("the sun rises on one side and sets on the other", () => {
  assert.ok(getSky({ date: at(7), latitude: 31.2 }).sunSide < 0);
  assert.ok(getSky({ date: at(17), latitude: 31.2 }).sunSide > 0);
});

test("winter snows, the wet season rains in the afternoon, and an override wins", () => {
  assert.equal(getSky({ date: at(10, 0), latitude: 51.5 }).weather, "snow");
  assert.equal(getSky({ date: at(15, 7), latitude: 1.35 }).weather, "rain");
  assert.equal(getSky({ date: at(10, 7), latitude: 1.35 }).weather, "clear");
  const overridden = getSky({
    date: at(12),
    latitude: 31.2,
    override: { hour: 22, season: "summer", weather: "clear" },
  });
  assert.equal(overridden.hour, 22);
  assert.equal(overridden.season, "summer");
  assert.ok(overridden.lamp > 0.9);
});

test("rain clouds dim the sunlight", () => {
  const sunny = getSky({ date: at(12), latitude: 31.2 });
  const rainy = getSky({
    date: at(12),
    latitude: 31.2,
    override: { hour: undefined, season: undefined, weather: "rain" },
  });
  assert.ok(rainy.sunlight < sunny.sunlight * 0.3);
  assert.ok(rainy.light.glowAlpha < sunny.light.glowAlpha);
});

test("longitude moves the sun to solar time", () => {
  const date = at(12);
  const offsetHours = -date.getTimezoneOffset() / 60;
  const onMeridian = getSky({
    date,
    latitude: 31.2,
    longitude: offsetHours * 15,
  });
  const westOfIt = getSky({
    date,
    latitude: 31.2,
    longitude: offsetHours * 15 - 30,
  });
  assert.ok(westOfIt.sunElevation < onMeridian.sunElevation);
});

test("a longitude far from the clock's time zone, as behind a VPN, is ignored", () => {
  const date = at(12);
  const offsetHours = -date.getTimezoneOffset() / 60;
  const faraway = getSky({
    date,
    latitude: 31.2,
    longitude: offsetHours * 15 - 150,
  });
  const clockOnly = getSky({ date, latitude: 31.2 });
  assert.equal(faraway.sunElevation, clockOnly.sunElevation);
});
