import assert from "node:assert/strict";
import { test } from "node:test";

import { getDraftRowMarks } from "./get-draft-row-marks";

test("puts a collapsed caret on the line that owns its offset", () => {
  assert.deepEqual(
    getDraftRowMarks({
      start: 6,
      length: 10,
      nextStart: 17,
      selection: { start: 9, end: 9 },
    }),
    { selected: undefined, caretAt: 3 }
  );
});

test("leaves the caret to the next line from its start offset on", () => {
  assert.deepEqual(
    getDraftRowMarks({
      start: 0,
      length: 5,
      nextStart: 6,
      selection: { start: 6, end: 6 },
    }).caretAt,
    undefined
  );
});

test("clamps a caret in a dropped space to the end of the line", () => {
  assert.equal(
    getDraftRowMarks({
      start: 0,
      length: 5,
      nextStart: 6,
      selection: { start: 5, end: 5 },
    }).caretAt,
    5
  );
});

test("marks the part of a selection that overlaps the line", () => {
  assert.deepEqual(
    getDraftRowMarks({
      start: 6,
      length: 10,
      nextStart: 17,
      selection: { start: 0, end: 10 },
    }),
    { selected: { from: 0, to: 4 }, caretAt: undefined }
  );
});

test("marks nothing on a line outside the selection", () => {
  assert.equal(
    getDraftRowMarks({
      start: 17,
      length: 9,
      nextStart: undefined,
      selection: { start: 0, end: 10 },
    }).selected,
    undefined
  );
});
