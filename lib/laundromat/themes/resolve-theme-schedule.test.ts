import assert from "node:assert/strict";
import { test } from "node:test";

import { parseThemeSchedule } from "./parse-theme-schedule";
import { parseThemeSchedulesBody } from "./parse-theme-schedules-body";
import { resolveThemeSchedule } from "./resolve-theme-schedule";
import type { ThemeSchedule } from "./theme-schedule";

function buildSchedule(options: Partial<ThemeSchedule> = {}): ThemeSchedule {
  return {
    id: "halloween",
    themeId: "halloween",
    startMonth: 10,
    startDay: 15,
    endMonth: 11,
    endDay: 1,
    timeZone: "UTC",
    priority: 0,
    ...options,
  };
}

function resolve(options: {
  date: string;
  schedules?: ThemeSchedule[];
  availableThemeIds?: string[];
}) {
  return resolveThemeSchedule({
    nowMs: Date.parse(options.date),
    schedules: options.schedules ?? [buildSchedule()],
    availableThemeIds: options.availableThemeIds ?? [
      "classic",
      "halloween",
      "christmas",
    ],
  });
}

test("annual periods include the start and exclude the end, down to a millisecond", () => {
  for (const year of [2026, 2027]) {
    assert.equal(
      resolve({ date: `${year}-10-14T23:59:59.999Z` }).themeId,
      "classic"
    );
    assert.equal(
      resolve({ date: `${year}-10-15T00:00:00.000Z` }).themeId,
      "halloween"
    );
    assert.equal(
      resolve({ date: `${year}-10-31T23:59:59.999Z` }).themeId,
      "halloween"
    );
    const ended = resolve({ date: `${year}-11-01T00:00:00.000Z` });
    assert.equal(ended.themeId, "classic");
    assert.equal(
      ended.nextChangeAtMs,
      Date.parse(`${year + 1}-10-15T00:00:00Z`)
    );
  }
});

test("December to January periods recur across years", () => {
  const schedules = [
    buildSchedule({
      themeId: "christmas",
      startMonth: 12,
      startDay: 15,
      endMonth: 1,
      endDay: 7,
    }),
  ];
  for (const date of ["2026-12-25T12:00:00Z", "2027-01-06T23:59:59Z"]) {
    const result = resolve({ date, schedules });
    assert.equal(result.themeId, "christmas");
    assert.equal(result.nextChangeAtMs, Date.parse("2027-01-07T00:00:00Z"));
  }
  assert.equal(
    resolve({ date: "2027-01-07T00:00:00Z", schedules }).themeId,
    "classic"
  );
});

test("schedule timezone controls midnight independently of the visitor timezone", () => {
  const schedules = [buildSchedule({ timeZone: "Asia/Singapore" })];
  assert.equal(
    resolve({ date: "2026-10-14T15:59:59Z", schedules }).themeId,
    "classic"
  );
  const active = resolve({ date: "2026-10-14T16:00:00Z", schedules });
  assert.equal(active.themeId, "halloween");
  assert.equal(active.nextChangeAtMs, Date.parse("2026-10-31T16:00:00Z"));
});

test("next boundary observes DST changes and fractional timezone offsets", () => {
  const schedules = [
    buildSchedule({
      startMonth: 3,
      startDay: 7,
      endMonth: 3,
      endDay: 10,
      timeZone: "America/New_York",
    }),
  ];
  assert.equal(
    resolve({ date: "2026-03-07T05:00:00Z", schedules }).nextChangeAtMs,
    Date.parse("2026-03-10T04:00:00Z")
  );
  const fractional = [buildSchedule({ timeZone: "Asia/Kathmandu" })];
  assert.equal(
    resolve({ date: "2026-10-14T00:00:00Z", schedules: fractional })
      .nextChangeAtMs,
    Date.parse("2026-10-14T18:15:00Z")
  );
});

test("overlaps choose priority then stable ID regardless of row order", () => {
  const low = buildSchedule({ id: "a", themeId: "christmas", priority: 1 });
  const high = buildSchedule({ id: "b", priority: 2 });
  assert.equal(
    resolve({ date: "2026-10-31T00:00:00Z", schedules: [low, high] }).themeId,
    "halloween"
  );
  const tie = { ...high, priority: 1 };
  for (const schedules of [
    [low, tie],
    [tie, low],
  ]) {
    assert.equal(
      resolve({ date: "2026-10-31T00:00:00Z", schedules }).themeId,
      "christmas"
    );
  }
});

test("unsupported themes cannot displace a supported schedule or create a transition", () => {
  const schedules = [
    buildSchedule({ themeId: "future", priority: 100 }),
    buildSchedule(),
  ];
  assert.equal(
    resolve({ date: "2026-10-31T00:00:00Z", schedules }).themeId,
    "halloween"
  );
  assert.deepEqual(
    resolve({
      date: "2026-10-31T00:00:00Z",
      schedules,
      availableThemeIds: ["classic"],
    }),
    { themeId: "classic", nextChangeAtMs: undefined }
  );
  assert.deepEqual(resolve({ date: "2026-10-31T00:00:00Z", schedules: [] }), {
    themeId: "classic",
    nextChangeAtMs: undefined,
  });
});

test("invalid dates, empty periods, timezones and payloads are rejected", () => {
  for (const value of [
    null,
    {},
    buildSchedule({ startMonth: 13 }),
    buildSchedule({ startDay: 0 }),
    buildSchedule({ startMonth: 2, startDay: 29 }),
    buildSchedule({ endMonth: 4, endDay: 31 }),
    buildSchedule({ endMonth: 10, endDay: 15 }),
    buildSchedule({ timeZone: "not-a-zone" }),
    buildSchedule({ priority: NaN }),
  ]) {
    assert.equal(parseThemeSchedule(value), undefined);
  }
  assert.deepEqual(parseThemeSchedule(buildSchedule()), buildSchedule());
  assert.equal(
    parseThemeSchedulesBody({ nowMs: NaN, schedules: [] }),
    undefined
  );
  assert.equal(parseThemeSchedulesBody({ nowMs: 0, schedules: {} }), undefined);
  assert.deepEqual(
    parseThemeSchedulesBody({ nowMs: 0, schedules: [buildSchedule(), {}] }),
    { nowMs: 0, schedules: [buildSchedule()] }
  );
});
