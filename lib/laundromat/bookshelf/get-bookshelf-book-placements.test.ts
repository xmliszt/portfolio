import assert from "node:assert/strict";
import { test } from "node:test";

import { getBookshelfBookPlacements } from "./get-bookshelf-book-placements";
import { getBookshelfRows } from "./get-bookshelf-rows";

const rows = getBookshelfRows({
  position: { x: 10.5, y: 0, z: 0 },
  size: { w: 3, d: 1.8, h: 2.8 },
});

test("getBookshelfBookPlacements stands books side by side inside the shelf, under the board above", () => {
  for (const row of [rows.loved, rows.fresh]) {
    const books = getBookshelfBookPlacements({ row, bookIds: [1, 2, 3, 4, 5] });
    for (const [index, book] of books.entries()) {
      assert.ok(book.x0 >= row.x0 && book.x1 > book.x0);
      assert.ok(
        book.z0 === row.floorZ && book.z1 < row.ceilingZ,
        `${row.key} book ${book.id} reaches the board above`
      );
      assert.ok(
        book.frontY < row.frontY && book.backY > 0,
        `${row.key} book ${book.id} sticks out of the cabinet`
      );
      const previous = books.at(index - 1);
      if (index > 0 && previous !== undefined)
        assert.ok(book.x0 > previous.x1, "books overlap");
    }
  }
});

test("getBookshelfRows puts the loved shelf above the fresh one with the middle board between them", () => {
  assert.ok(rows.fresh.ceilingZ <= rows.loved.boardZ);
  assert.ok(rows.loved.floorZ > rows.fresh.ceilingZ);
  assert.ok(rows.loved.ceilingZ < rows.top);
});
