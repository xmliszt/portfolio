import assert from "node:assert/strict";
import { test } from "node:test";

import { getDoodlePlacement } from "./get-doodle-placement";

const book = { linesPerPage: 24, pageCount: 48 };

test("places a doodle on the next free line when it fits on that page", () => {
  assert.deepEqual(
    getDoodlePlacement({ ...book, linesUsed: 34, spaceLineCount: 7 }),
    {
      startsNewBook: false,
      isMoved: false,
      page: 2,
      lineStart: 11,
    }
  );
});

test("moves a doodle that would cross a page to the top of the next page", () => {
  assert.deepEqual(
    getDoodlePlacement({ ...book, linesUsed: 42, spaceLineCount: 7 }),
    {
      startsNewBook: false,
      isMoved: true,
      page: 3,
      lineStart: 1,
    }
  );
});

test("starts the next book when the last page has no room", () => {
  assert.deepEqual(
    getDoodlePlacement({ ...book, linesUsed: 48 * 24 - 3, spaceLineCount: 7 }),
    { startsNewBook: true, isMoved: false, page: 1, lineStart: 1 }
  );
});

test("fills a page exactly without moving", () => {
  assert.deepEqual(
    getDoodlePlacement({ ...book, linesUsed: 17, spaceLineCount: 7 }),
    {
      startsNewBook: false,
      isMoved: false,
      page: 1,
      lineStart: 18,
    }
  );
});
