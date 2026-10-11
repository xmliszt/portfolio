import assert from "node:assert/strict";
import { test } from "node:test";

import { formatClockTime } from "./format-clock-time";
import { formatRemainingTime } from "./format-remaining-time";

test("formats remaining time as mm:ss, rounding seconds up", () => {
  assert.equal(formatRemainingTime(60 * 60_000), "60:00");
  assert.equal(formatRemainingTime(1_122_001), "18:43");
  assert.equal(formatRemainingTime(1), "00:01");
  assert.equal(formatRemainingTime(0), "00:00");
  assert.equal(formatRemainingTime(-5_000), "00:00");
});

test("formats local clock time with a.m. and p.m.", () => {
  assert.equal(
    formatClockTime({
      timestampMs: new Date(2026, 0, 1, 1, 24).getTime(),
      locale: "en",
    }),
    "1:24 a.m."
  );
  assert.equal(
    formatClockTime({
      timestampMs: new Date(2026, 0, 1, 0, 5).getTime(),
      locale: "en",
    }),
    "12:05 a.m."
  );
  assert.equal(
    formatClockTime({
      timestampMs: new Date(2026, 0, 1, 12, 0).getTime(),
      locale: "en",
    }),
    "12:00 p.m."
  );
  assert.equal(
    formatClockTime({
      timestampMs: new Date(2026, 0, 1, 23, 59).getTime(),
      locale: "en",
    }),
    "11:59 p.m."
  );
});

test("formats clock time in the locale's own style outside English", () => {
  const timestampMs = new Date(2026, 0, 1, 13, 5).getTime();
  assert.equal(formatClockTime({ timestampMs, locale: "de" }), "13:05");
  assert.match(formatClockTime({ timestampMs, locale: "ja" }), /13:05/);
});
