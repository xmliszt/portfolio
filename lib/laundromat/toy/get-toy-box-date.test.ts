import assert from "node:assert/strict";
import { test } from "node:test";

import { advanceToyBox } from "./advance-toy-box";
import { getToyBoxDate } from "./get-toy-box-date";
import { getToyBoxWindow } from "./get-toy-box-window";
import { TOY_DELIVERY_TIMING } from "./toy-delivery-timing";

test("without an override the toy uses the device clock", () => {
  const now = new Date(2026, 9, 25, 12, 30);
  assert.equal(getToyBoxDate({ now }), now);
});

test("the override changes local time without mutating the device date", () => {
  const now = new Date(2026, 9, 25, 12, 30);
  const overridden = getToyBoxDate({ now, hourOverride: 19 + 55 / 60 });
  assert.equal(overridden.getHours(), 19);
  assert.equal(overridden.getMinutes(), 55);
  assert.equal(overridden.getDate(), 25);
  assert.equal(now.getHours(), 12);
  assert.equal(getToyBoxWindow(overridden).active, true);
  assert.equal(
    getToyBoxWindow(getToyBoxDate({ now, hourOverride: 21 })).active,
    false
  );
});

test("a frozen lab hour allows arrival animation to finish and can hide the box", () => {
  const now = new Date(2026, 9, 25, 12);
  const options = {
    now: getToyBoxDate({ now, hourOverride: 20 }),
    nowMs: 100,
    openingMs: 500,
    reducedMotion: false,
    visible: true,
  };
  const arriving = advanceToyBox({
    ...options,
    state: {
      windowStartedAtMs: undefined,
      openingStartedAtMs: undefined,
      view: { kind: "hidden" },
    },
  });
  assert.equal(arriving.view.kind, "arriving");
  const landed = advanceToyBox({
    ...options,
    state: arriving,
    nowMs: 100 + TOY_DELIVERY_TIMING.arrivalMs,
  });
  assert.equal(landed.view.kind, "closed");
  const hidden = advanceToyBox({
    ...options,
    state: landed,
    now: getToyBoxDate({ now, hourOverride: 12 }),
  });
  assert.equal(hidden.view.kind, "hidden");
  assert.equal(
    advanceToyBox({ ...options, state: hidden }).view.kind,
    "arriving"
  );
});
