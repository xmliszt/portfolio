import assert from "node:assert/strict";
import { test } from "node:test";

import { getDraftPlacement } from "./get-draft-placement";
import { getLinePosition } from "./get-line-position";
import { getSpreadOfPage } from "./get-spread-of-page";
import { layoutPageRows } from "./layout-page-rows";

test("maps a book line index to its page and row", () => {
  assert.deepEqual(getLinePosition({ lineIndex: 0, linesPerPage: 24 }), {
    page: 1,
    row: 0,
  });
  assert.deepEqual(getLinePosition({ lineIndex: 23, linesPerPage: 24 }), {
    page: 1,
    row: 23,
  });
  assert.deepEqual(getLinePosition({ lineIndex: 24, linesPerPage: 24 }), {
    page: 2,
    row: 0,
  });
});

test("puts page 1 on the right of the first spread and pairs even and odd pages", () => {
  assert.equal(getSpreadOfPage(1), 0);
  assert.equal(getSpreadOfPage(2), 1);
  assert.equal(getSpreadOfPage(3), 1);
  assert.equal(getSpreadOfPage(48), 24);
});

test("places a draft after the lines already used, like append_entry", () => {
  assert.deepEqual(
    getDraftPlacement({
      linesUsed: 30,
      lineCount: 4,
      linesPerPage: 24,
      pageCount: 48,
    }),
    { startsNewBook: false, page: 2, lineStart: 7, caretPage: 2 }
  );
});

test("moves the caret to the next page when the draft overflows the page", () => {
  assert.deepEqual(
    getDraftPlacement({
      linesUsed: 20,
      lineCount: 8,
      linesPerPage: 24,
      pageCount: 48,
    }),
    { startsNewBook: false, page: 1, lineStart: 21, caretPage: 2 }
  );
  assert.equal(
    getDraftPlacement({
      linesUsed: 20,
      lineCount: 5,
      linesPerPage: 24,
      pageCount: 48,
    }).caretPage,
    1
  );
});

test("starts the next book when the draft does not fit in the last page", () => {
  assert.deepEqual(
    getDraftPlacement({
      linesUsed: 1150,
      lineCount: 4,
      linesPerPage: 24,
      pageCount: 48,
    }),
    { startsNewBook: true, page: 1, lineStart: 1, caretPage: 1 }
  );
  assert.equal(
    getDraftPlacement({
      linesUsed: 1148,
      lineCount: 4,
      linesPerPage: 24,
      pageCount: 48,
    }).startsNewBook,
    false
  );
});

test("lays out an entry's rows and its meta line on its stored lines", () => {
  const rows = layoutPageRows({
    entries: [
      {
        id: "a",
        page: 1,
        lineStart: 3,
        lineCount: 3,
        lines: ["one", "two"],
        meta: "oct 8",
      },
    ],
    page: 1,
    linesPerPage: 24,
  });
  assert.deepEqual(
    rows.map(({ row, kind, text, isLastTextRow }) => ({
      row,
      kind,
      text,
      isLastTextRow,
    })),
    [
      { row: 2, kind: "text", text: "one", isLastTextRow: false },
      { row: 3, kind: "text", text: "two", isLastTextRow: true },
      { row: 4, kind: "meta", text: "oct 8", isLastTextRow: false },
    ]
  );
});

test("splits an entry that continues onto the next page", () => {
  const entry = {
    id: "a",
    page: 1,
    lineStart: 23,
    lineCount: 4,
    lines: ["one", "two", "three"],
    meta: "oct 8",
  };
  const first = layoutPageRows({ entries: [entry], page: 1, linesPerPage: 24 });
  const second = layoutPageRows({
    entries: [entry],
    page: 2,
    linesPerPage: 24,
  });
  assert.deepEqual(
    first.map(({ row, text }) => [row, text]),
    [
      [22, "one"],
      [23, "two"],
    ]
  );
  assert.deepEqual(
    second.map(({ row, text }) => [row, text]),
    [
      [0, "three"],
      [1, "oct 8"],
    ]
  );
});

test("cuts a reader's wrap that runs longer than the stored line count", () => {
  const rows = layoutPageRows({
    entries: [
      {
        id: "a",
        page: 1,
        lineStart: 1,
        lineCount: 2,
        lines: ["one", "two"],
        meta: "oct 8",
      },
    ],
    page: 1,
    linesPerPage: 24,
  });
  assert.deepEqual(
    rows.map(({ text, isLastTextRow }) => [text, isLastTextRow]),
    [
      ["one", true],
      ["oct 8", false],
    ]
  );
});

test("lays out a draft without a meta line", () => {
  const rows = layoutPageRows({
    entries: [
      {
        id: "draft",
        page: 1,
        lineStart: 1,
        lineCount: 2,
        lines: ["a", "b"],
        meta: undefined,
      },
    ],
    page: 1,
    linesPerPage: 24,
  });
  assert.deepEqual(
    rows.map(({ text }) => text),
    ["a", "b"]
  );
});
