import assert from "node:assert/strict";
import { test } from "node:test";

import { BOOKSHELF_GEOMETRY } from "./bookshelf-geometry";
import { getBookshelfBookSize } from "./get-bookshelf-book-size";
import { paginateBookshelfRow } from "./paginate-bookshelf-row";

test("paginateBookshelfRow fills each page up to the shelf width, keeps the order and never splits a book", () => {
  const bookIds = Array.from({ length: 60 }, (_, i) => i + 1);
  const width = 2.69;
  const pages = paginateBookshelfRow({ bookIds, width });
  assert.deepEqual(pages.flat(), bookIds);
  for (const [index, page] of pages.entries()) {
    const used =
      page.reduce((sum, id) => sum + getBookshelfBookSize(id).thickness, 0) +
      (page.length - 1) * BOOKSHELF_GEOMETRY.bookGap;
    assert.ok(used <= width, `page ${index} overflows`);
    const next = pages.at(index + 1)?.at(0);
    if (next !== undefined) {
      assert.ok(
        used +
          BOOKSHELF_GEOMETRY.bookGap +
          getBookshelfBookSize(next).thickness >
          width,
        `page ${index} had room for the next book`
      );
    }
  }
});

test("paginateBookshelfRow gives one empty page for an empty shelf", () => {
  assert.deepEqual(paginateBookshelfRow({ bookIds: [], width: 2.69 }), [[]]);
});
