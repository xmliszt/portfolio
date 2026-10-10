import assert from "node:assert/strict";
import { test } from "node:test";

import { describeTv } from "./describe-tv";
import { describeTvControl } from "./describe-tv-control";
import type { TvState } from "./tv-state";

const settings = {
  stations: ["rainy café", "piano night", "late wash"],
  volumeStepPercent: 10,
};
const on: TvState = { on: true, station: 1, volumePercent: 60 };
const off: TvState = { ...on, on: false };

test("names the next station on the tuner", () => {
  assert.deepEqual(
    describeTvControl({ control: "tuner", state: on, settings }),
    {
      label: "TV channel, ch 02 · piano night",
      tooltip: "next station · late wash",
      enabled: true,
    }
  );
});

test("states the volume", () => {
  assert.equal(
    describeTvControl({ control: "volume", state: on, settings }).tooltip,
    "volume · 60%"
  );
});

test("offers to turn the TV off when on, and on when off", () => {
  assert.equal(
    describeTvControl({ control: "power", state: on, settings }).tooltip,
    "turn off"
  );
  assert.equal(
    describeTvControl({ control: "power", state: off, settings }).tooltip,
    "turn on"
  );
});

test("turns the TV on from the screen, and shows the station once on", () => {
  assert.deepEqual(
    describeTvControl({ control: "screen", state: off, settings }),
    { label: "TV screen, off, turn on", tooltip: "turn on", enabled: true }
  );
  assert.deepEqual(
    describeTvControl({ control: "screen", state: on, settings }),
    {
      label: "TV screen, ch 02 · piano night",
      tooltip: "ch 02 · piano night",
      enabled: false,
    }
  );
});

test("labels the TV body with its state", () => {
  assert.deepEqual(describeTv({ state: off, settings }), {
    label: "TV, off",
    tooltip: "tv · off",
  });
  assert.deepEqual(describeTv({ state: on, settings }), {
    label: "TV, on, ch 02 · piano night",
    tooltip: "ch 02 · piano night",
  });
});
