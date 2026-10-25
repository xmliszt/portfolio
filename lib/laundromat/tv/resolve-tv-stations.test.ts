import assert from "node:assert/strict";
import { test } from "node:test";

import { bedroomConfig } from "@/lib/laundromat/first-visit/bedroom-config";
import { sceneConfig } from "@/lib/laundromat/scene-config";
import { applySceneTheme } from "@/lib/laundromat/themes/apply-scene-theme";
import { themes } from "@/lib/laundromat/themes/themes";

import { resolveTvStations } from "./resolve-tv-stations";
import { transitionTv } from "./transition-tv";

const defaults = sceneConfig.details.tv;
const halloween = applySceneTheme({
  scene: sceneConfig,
  bedroom: bedroomConfig,
  theme: themes.halloween,
}).scene.details.tv;

test("Halloween prepends its station without changing the regular lineup", () => {
  assert.equal(halloween.stations.length, defaults.stations.length + 1);
  assert.equal(halloween.stations.at(0)?.id, halloween.initialStationId);
  assert.equal(halloween.stations.at(0)?.videoId, "XQAqEhO8rZQ");
  assert.deepEqual(halloween.stations.slice(1), defaults.stations);
  assert.equal(
    defaults.stations.some((station) => station.id === "halloween"),
    false
  );
});

test("an idle TV selects the theme station and preserves volume", () => {
  const resolved = resolveTvStations({
    session: {
      stations: defaults.stations,
      tv: { on: false, station: 4, volumePercent: 30 },
    },
    ...halloween,
  });
  assert.equal(resolved.stations[resolved.tv.station]?.id, "halloween");
  assert.equal(resolved.tv.volumePercent, 30);
  assert.equal(resolved.tv.on, false);
});

test("theme changes preserve the playing station in either direction", () => {
  for (const [from, to] of [
    [defaults, halloween],
    [halloween, defaults],
  ]) {
    const session = {
      stations: from.stations,
      tv: { on: true, station: 0, volumePercent: 40 },
    };
    assert.equal(resolveTvStations({ session, ...to }), session);
    const poweredOff = {
      ...session,
      tv: transitionTv({
        state: session.tv,
        event: { type: "power" },
        settings: from,
      }),
    };
    const next = resolveTvStations({ session: poweredOff, ...to });
    assert.equal(next.stations, to.stations);
    assert.equal(next.tv.station, 0);
    assert.equal(next.tv.volumePercent, 40);
  }
});

test("leaving Halloween preserves a regular station by identity", () => {
  const next = resolveTvStations({
    session: {
      stations: halloween.stations,
      tv: { on: false, station: 5, volumePercent: 50 },
    },
    ...defaults,
  });
  assert.equal(next.tv.station, 4);
  assert.equal(next.stations[next.tv.station]?.id, halloween.stations[5]?.id);
});

test("an unchanged lineup keeps manual tuning", () => {
  const session = {
    stations: halloween.stations,
    tv: { on: false, station: 7, volumePercent: 60 },
  };
  assert.equal(resolveTvStations({ session, ...halloween }), session);
});

test("the Halloween tuner reaches all stations and skips to the regular lineup", () => {
  const state = { on: true, station: 0, volumePercent: 60 };
  const next = transitionTv({
    state,
    event: { type: "tune", step: 1 },
    settings: halloween,
  });
  assert.equal(halloween.stations[next.station]?.id, "rainy-cafe");
  const previous = transitionTv({
    state,
    event: { type: "tune", step: -1 },
    settings: halloween,
  });
  assert.equal(previous.station, 12);
  assert.equal(halloween.stations[previous.station]?.id, "deep-space");
  assert.equal(
    transitionTv({
      state: previous,
      event: { type: "tune", step: 1 },
      settings: halloween,
    }).station,
    0
  );
});
