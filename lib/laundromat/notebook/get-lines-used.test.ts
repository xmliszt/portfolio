import assert from "node:assert/strict";
import { test } from "node:test";

import { getLinesUsed } from "./get-lines-used";

test("a just-placed entry past the stored count moves the count to its end", () => {
  assert.equal(
    getLinesUsed({
      linesUsed: 4,
      linesPerPage: 24,
      entries: [
        { kind: "text", body: "hi", page: 1, lineStart: 1, lineCount: 4 },
        { kind: "text", body: "yo", page: 1, lineStart: 5, lineCount: 3 },
      ],
    }),
    7
  );
});

test("a hidden last entry does not hold its lines", () => {
  assert.equal(
    getLinesUsed({
      linesUsed: 4,
      linesPerPage: 24,
      entries: [
        { kind: "text", body: "hi", page: 1, lineStart: 1, lineCount: 4 },
        { kind: "text", body: "", page: 1, lineStart: 5, lineCount: 3 },
        {
          kind: "doodle",
          drawing: undefined,
          page: 1,
          lineStart: 8,
          lineCount: 6,
        },
      ],
    }),
    4
  );
});

test("the stored count wins when it runs further than every visible entry", () => {
  assert.equal(
    getLinesUsed({
      linesUsed: 30,
      linesPerPage: 24,
      entries: [
        { kind: "text", body: "hi", page: 1, lineStart: 1, lineCount: 4 },
        { kind: "text", body: "", page: 1, lineStart: 5, lineCount: 26 },
      ],
    }),
    30
  );
});
