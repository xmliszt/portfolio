import assert from "node:assert/strict";
import { test } from "node:test";

import { resolveTheme } from "./resolve-theme";

test("auto is light from 07:00 SGT", () => {
  assert.equal(
    resolveTheme({ preference: "auto", now: new Date("2026-11-02T23:00:00Z") }),
    "light"
  );
});

test("auto is still light at 18:59 SGT", () => {
  assert.equal(
    resolveTheme({ preference: "auto", now: new Date("2026-11-03T10:59:00Z") }),
    "light"
  );
});

test("auto is dark from 19:00 SGT", () => {
  assert.equal(
    resolveTheme({ preference: "auto", now: new Date("2026-11-03T11:00:00Z") }),
    "dark"
  );
});

test("auto is dark just before 07:00 SGT", () => {
  assert.equal(
    resolveTheme({ preference: "auto", now: new Date("2026-11-02T22:59:00Z") }),
    "dark"
  );
});

test("a fixed choice ignores the clock", () => {
  assert.equal(
    resolveTheme({ preference: "dark", now: new Date("2026-11-03T04:00:00Z") }),
    "dark"
  );
  assert.equal(
    resolveTheme({
      preference: "light",
      now: new Date("2026-11-03T14:00:00Z"),
    }),
    "light"
  );
});
