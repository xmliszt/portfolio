import assert from "node:assert/strict";
import { test } from "node:test";

import { en } from "@/lib/laundromat/i18n/copy/en";

import { describeEntranceMat } from "./describe-entrance-mat";

test("the mat leads home with dry, wet or machine-held laundry", () => {
  for (const homecoming of [
    { kind: "fresh", cleanPile: true },
    { kind: "away" },
    { kind: "carrying", laundry: "wet" },
  ] as const) {
    const mat = describeEntranceMat({ homecoming, copy: en });
    assert.equal(mat.canLeave, true);
    assert.ok(mat.tooltip.startsWith("go back home"), mat.tooltip);
  }
});

test("the mat keeps the visitor in until dirty laundry is in a washer", () => {
  const mat = describeEntranceMat({
    homecoming: { kind: "carrying", laundry: "dirty" },
    copy: en,
  });
  assert.equal(mat.canLeave, false);
  assert.equal(mat.tooltip, "wash it first · put the clothes in a washer");
});
