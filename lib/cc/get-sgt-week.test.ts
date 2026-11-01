import assert from "node:assert/strict";
import { test } from "node:test";

import { getSgtWeek } from "./get-sgt-week";

test("snaps a date to its Monday-to-Sunday week", () => {
  const week = getSgtWeek({ date: "2026-11-03" });
  assert.deepEqual(week.days, [
    "2026-11-02",
    "2026-11-03",
    "2026-11-04",
    "2026-11-05",
    "2026-11-06",
    "2026-11-07",
    "2026-11-08",
  ]);
  assert.equal(week.previous, "2026-10-26");
  assert.equal(week.next, "2026-11-09");
});

test("keeps a Sunday in the week that started the Monday before", () => {
  assert.equal(getSgtWeek({ date: "2026-11-08" }).days.at(0), "2026-11-02");
});

test("crosses a year boundary", () => {
  const week = getSgtWeek({ date: "2027-01-01" });
  assert.equal(week.days.at(0), "2026-12-28");
  assert.equal(week.days.at(6), "2027-01-03");
});
