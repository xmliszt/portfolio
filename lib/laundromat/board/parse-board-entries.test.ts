import assert from "node:assert/strict";
import { test } from "node:test";

import { en } from "@/lib/laundromat/i18n/copy/en";

import { getBoardEntries } from "./get-board-entries";
import { parseBoardEntries } from "./parse-board-entries";

test("reads the entries a version response sends", () => {
  const updates = getBoardEntries({ copy: en });
  assert.deepEqual(
    parseBoardEntries(JSON.parse(JSON.stringify({ buildId: "abc", updates }))),
    updates
  );
});

test("returns undefined for a body without well-formed entries", () => {
  for (const value of [
    undefined,
    null,
    { buildId: "abc" },
    { updates: "none" },
    { updates: [{ id: "opening", title: "opening day" }] },
    { updates: [{ ...getBoardEntries({ copy: en }).at(0), body: 7 }] },
  ]) {
    assert.equal(parseBoardEntries(value), undefined);
  }
});
