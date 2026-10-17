import assert from "node:assert/strict";
import { test } from "node:test";

import { parseRoomSoundSwitches } from "@/lib/laundromat/audio/parse-room-sound-switches";
import { parseRoomSoundVolumes } from "@/lib/laundromat/audio/parse-room-sound-volumes";
import type { WeatherPlace } from "@/lib/laundromat/weather/weather-place";
import type { WeatherCondition } from "@/lib/laundromat/weather/weather-reading";

import { buildSettingsTicket } from "./build-settings-ticket";
import { readSettingsTicket } from "./read-settings-ticket";
import type { SettingsTicketTv } from "./settings-ticket";

const LISBON = {
  name: "Lisbon",
  region: "Lisbon",
  country: "Portugal",
  countryCode: "PT",
  latitude: 38.72,
  longitude: -9.13,
} satisfies WeatherPlace;

function buildTicketJson(options: {
  tv?: SettingsTicketTv;
  weatherPlace?: WeatherPlace;
  weatherCondition?: WeatherCondition;
}) {
  return JSON.parse(
    JSON.stringify(
      buildSettingsTicket({
        printedAt: new Date("2026-10-17T06:00:00.000Z"),
        renderQuality: "lite",
        temperatureUnit: "fahrenheit",
        weatherPlace: options.weatherPlace,
        weatherCondition: options.weatherCondition,
        muted: false,
        switches: { ...parseRoomSoundSwitches(null), tv: false },
        volumes: { ...parseRoomSoundVolumes(null), weather: 1.4 },
        tv: options.tv,
      })
    )
  );
}

test("reads back everything a printed ticket holds", () => {
  const read = readSettingsTicket(
    buildTicketJson({
      tv: { station: "smoky-jazz", volumePercent: 30 },
      weatherPlace: LISBON,
      weatherCondition: "rain",
    })
  );
  assert.ok(read);
  assert.equal(read.printedAt, "2026-10-17T06:00:00.000Z");
  assert.equal(read.renderQuality, "lite");
  assert.equal(read.temperatureUnit, "fahrenheit");
  assert.equal(read.muted, false);
  assert.equal(read.switches.tv, false);
  assert.equal(read.switches.machines, true);
  assert.equal(read.volumes.weather, 1.4);
  assert.deepEqual(read.tv, { station: "smoky-jazz", volumePercent: 30 });
  assert.deepEqual(read.weatherPlace, LISBON);
  assert.equal(read.weatherCondition, "rain");
});

test("writes live for a place and sky the visitor did not choose", () => {
  const ticket = buildTicketJson({});
  assert.equal(ticket.settings.weather.place, "live");
  assert.equal(ticket.settings.weather.condition, "live");
  const read = readSettingsTicket(ticket);
  assert.equal(read?.weatherPlace, "live");
  assert.equal(read?.weatherCondition, "live");
});

test("restores no weather from a ticket printed without one", () => {
  const ticket = buildTicketJson({});
  delete ticket.settings.weather;
  const read = readSettingsTicket(ticket);
  assert.equal(read?.weatherPlace, undefined);
  assert.equal(read?.weatherCondition, undefined);
});

test("leaves out the tv when the ticket has none", () => {
  const ticket = buildTicketJson({});
  assert.equal("tv" in ticket.settings, false);
  assert.equal(readSettingsTicket(ticket)?.tv, undefined);
});

test("refuses files that are not laundro.cafe settings tickets", () => {
  assert.equal(readSettingsTicket(undefined), undefined);
  assert.equal(readSettingsTicket([]), undefined);
  assert.equal(
    readSettingsTicket({ app: "other", kind: "settings", settings: {} }),
    undefined
  );
  assert.equal(
    readSettingsTicket({ app: "laundro.cafe", kind: "laundry", settings: {} }),
    undefined
  );
  assert.equal(
    readSettingsTicket({ app: "laundro.cafe", kind: "settings" }),
    undefined
  );
});

test("keeps what it can read from a partial or damaged ticket", () => {
  const read = readSettingsTicket({
    app: "laundro.cafe",
    kind: "settings",
    version: 7,
    settings: {
      renderQuality: "ultra",
      temperatureUnit: "kelvin",
      sound: "loud",
      roomSounds: {
        weather: { volume: 9 },
        machines: { on: "yes", volume: -2 },
        radio: { on: false, volume: 0 },
        lamp: { on: false },
      },
      tv: { station: "not-a-station", volumePercent: 40 },
      weather: { place: { name: "Atlantis" }, condition: "hail" },
    },
  });
  assert.ok(read);
  assert.equal(read.printedAt, undefined);
  assert.equal(read.renderQuality, undefined);
  assert.equal(read.temperatureUnit, undefined);
  assert.equal(read.muted, undefined);
  assert.deepEqual(read.switches, { lamp: false });
  assert.deepEqual(read.volumes, { machines: 0, weather: 1.5 });
  assert.equal(read.tv, undefined);
  assert.equal(read.weatherPlace, undefined);
  assert.equal(read.weatherCondition, undefined);
});
