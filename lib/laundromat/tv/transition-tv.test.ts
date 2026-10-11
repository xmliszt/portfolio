import assert from "node:assert/strict";
import { test } from "node:test";

import { transitionTv } from "./transition-tv";
import type { TvEvent, TvState } from "./tv-state";
import { TV_STATION_IDS } from "./tv-state";

const settings = {
  stations: TV_STATION_IDS.slice(0, 3).map((id) => ({
    id,
    videoId: id,
    channel: "Lofi Girl",
    placeholder: false,
  })),
  volumeStepPercent: 10,
};

function transition(options: { state: TvState; event: TvEvent }) {
  return transitionTv({ ...options, settings });
}

const off: TvState = { on: false, station: 0, volumePercent: 60 };

test("toggles power", () => {
  assert.equal(transition({ state: off, event: { type: "power" } }).on, true);
});

test("wraps tuning past either end of the station list", () => {
  const last = { ...off, station: 2 };
  assert.equal(
    transition({ state: last, event: { type: "tune", step: 1 } }).station,
    0
  );
  assert.equal(
    transition({ state: off, event: { type: "tune", step: -1 } }).station,
    2
  );
});

test("steps volume and wraps it past either end of 0–100%", () => {
  assert.equal(
    transition({ state: off, event: { type: "volume", step: 1 } })
      .volumePercent,
    70
  );
  const loud = { ...off, volumePercent: 100 };
  assert.equal(
    transition({ state: loud, event: { type: "volume", step: 1 } })
      .volumePercent,
    0
  );
  const quiet = { ...off, volumePercent: 0 };
  assert.equal(
    transition({ state: quiet, event: { type: "volume", step: -1 } })
      .volumePercent,
    100
  );
});
