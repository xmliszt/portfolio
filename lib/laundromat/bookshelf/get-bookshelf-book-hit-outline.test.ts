import assert from "node:assert/strict";
import { test } from "node:test";

import type { ScreenPoint } from "@/lib/laundromat/project-iso-point";
import { projectIsoPoint } from "@/lib/laundromat/project-iso-point";
import { sceneConfig } from "@/lib/laundromat/scene-config";

import type { BookshelfRow } from "./bookshelf-row";
import { getBookshelfBookHitOutline } from "./get-bookshelf-book-hit-outline";
import { getBookshelfBookPlacements } from "./get-bookshelf-book-placements";
import { getBookshelfInnerX } from "./get-bookshelf-inner-x";
import { getBookshelfRows } from "./get-bookshelf-rows";
import { paginateBookshelfRow } from "./paginate-bookshelf-row";

const projection = { unit: 40, origin: { x: 0, y: 0 } };
const shelf = sceneConfig.objects.find((object) => object.id === "bookshelf");
assert.ok(shelf);
const rows = getBookshelfRows(shelf);
const innerX = getBookshelfInnerX(shelf);

function isInside(point: ScreenPoint, polygon: ScreenPoint[]) {
  const sides = polygon.map((start, index) => {
    const end = polygon[(index + 1) % polygon.length];
    return (
      (end.x - start.x) * (point.y - start.y) -
      (end.y - start.y) * (point.x - start.x)
    );
  });
  return (
    sides.every((side) => side > 1e-6) || sides.every((side) => side < -1e-6)
  );
}

function fullPage(row: BookshelfRow, firstId: number) {
  const ids = Array.from({ length: 30 }, (_, i) => firstId + i);
  const page =
    paginateBookshelfRow({ bookIds: ids, width: row.x1 - row.x0 }).at(0) ?? [];
  return getBookshelfBookPlacements({ row, bookIds: page });
}

function spineGrid(book: ReturnType<typeof fullPage>[number]) {
  return Array.from({ length: 5 }, (_, i) => i).flatMap((i) =>
    Array.from({ length: 9 }, (_, j) => j).map((j) =>
      projectIsoPoint({
        point: {
          x: book.x0 + ((book.x1 - book.x0) * (i + 0.5)) / 5,
          y: book.frontY,
          z: book.z0 + ((book.z1 - book.z0) * (j + 0.5)) / 9,
        },
        projection,
      })
    )
  );
}

test("no point of a visible spine lies inside a hit outline of a book on the other shelf", () => {
  const shelves = [
    { row: rows.loved, books: fullPage(rows.loved, 1) },
    { row: rows.fresh, books: fullPage(rows.fresh, 101) },
  ];
  for (const [index, { books }] of shelves.entries()) {
    const other = shelves[1 - index];
    const otherOutlines = other.books.map(
      (book) =>
        getBookshelfBookHitOutline({ book, row: other.row, innerX, projection })
          .outline
    );
    for (const book of books) {
      const covered = spineGrid(book).filter((point) =>
        otherOutlines.some((outline) => isInside(point, outline))
      );
      assert.equal(
        covered.length,
        0,
        `book ${book.id} has ${covered.length} spine points under the other shelf`
      );
    }
  }
});
