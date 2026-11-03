import assert from "node:assert/strict";
import { test } from "node:test";

import { parseThemePreference } from "./parse-theme-preference";

test("keeps a known preference", () => {
  assert.equal(parseThemePreference("light"), "light");
});

test("falls back to auto for a missing or unknown value", () => {
  assert.equal(parseThemePreference(undefined), "auto");
  assert.equal(parseThemePreference("sepia"), "auto");
});
