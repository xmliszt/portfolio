import assert from "node:assert/strict";
import { test } from "node:test";

import { formatSgt } from "./format-sgt";

const date = new Date("2026-09-03T08:01:09Z");

test("formats each pattern in Singapore time", () => {
  assert.equal(formatSgt({ date, pattern: "HH:mm" }), "16:01");
  assert.equal(formatSgt({ date, pattern: "HH:mm:ss" }), "16:01:09");
  assert.equal(formatSgt({ date, pattern: "EEE dd MMM" }), "Thu 03 Sep");
  assert.equal(
    formatSgt({ date, pattern: "EEE dd MMM HH:mm" }),
    "Thu 03 Sep 16:01"
  );
  assert.equal(formatSgt({ date, pattern: "yyyy-MM-dd" }), "2026-09-03");
});

test("prints midnight as 00:00 on the Singapore date", () => {
  const midnight = new Date("2026-12-31T16:00:00Z");
  assert.equal(formatSgt({ date: midnight, pattern: "HH:mm" }), "00:00");
  assert.equal(
    formatSgt({ date: midnight, pattern: "yyyy-MM-dd" }),
    "2027-01-01"
  );
});
