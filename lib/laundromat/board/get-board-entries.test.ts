import assert from "node:assert/strict";
import { test } from "node:test";

import { en } from "@/lib/laundromat/i18n/copy/en";
import { ja } from "@/lib/laundromat/i18n/copy/ja";

import { BOARD_UPDATES } from "./board-updates";
import { getBoardEntries } from "./get-board-entries";

test("returns every update, newest first, without a count", () => {
  const dates = getBoardEntries({ copy: en }).map((entry) => entry.isoDate);
  assert.equal(dates.length, BOARD_UPDATES.length);
  assert.deepEqual(dates, dates.toSorted().toReversed());
});

test("returns the newest `count` updates", () => {
  const all = getBoardEntries({ copy: en }).map((entry) => entry.id);
  assert.deepEqual(
    getBoardEntries({ copy: en, count: 3 }).map((entry) => entry.id),
    all.slice(0, 3)
  );
});

test("formats the day for the copy's locale and keeps the ISO date", () => {
  const [english] = getBoardEntries({ copy: en, count: 1 });
  const [japanese] = getBoardEntries({ copy: ja, count: 1 });
  assert.equal(english?.date, "Oct 13");
  assert.equal(japanese?.date, "10月13日");
  assert.equal(english?.isoDate, "2026-10-13");
  assert.equal(english?.tag, "window");
});
