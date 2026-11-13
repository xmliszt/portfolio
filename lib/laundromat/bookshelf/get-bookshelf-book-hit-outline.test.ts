import assert from "node:assert/strict";
import { test } from "node:test";

import type { ScreenPoint } from "@/lib/laundromat/project-iso-point";
import { sceneConfig } from "@/lib/laundromat/scene-config";

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
  const signs = polygon.map((start, index) => {
    const end = polygon[(index + 1) % polygon.length];
    return Math.sign(
      (end.x - start.x) * (point.y - start.y) -
        (end.y - start.y) * (point.x - start.x)
    );
  });
  return signs.every((sign) => sign >= 0) || signs.every((sign) => sign <= 0);
}

function centerOf(polygon: ScreenPoint[]) {
  return {
    x: polygon.reduce((sum, point) => sum + point.x, 0) / polygon.length,
    y: polygon.reduce((sum, point) => sum + point.y, 0) / polygon.length,
  };
}

function fullPage(row: (typeof rows)["loved"], firstId: number) {
  const ids = Array.from({ length: 30 }, (_, i) => firstId + i);
  const page =
    paginateBookshelfRow({ bookIds: ids, width: row.x1 - row.x0 }).at(0) ?? [];
  return getBookshelfBookPlacements({ row, bookIds: page });
}

test("no book's hit outline covers a book on the other shelf", () => {
  const loved = fullPage(rows.loved, 1);
  const fresh = fullPage(rows.fresh, 101);
  const freshOutlines = fresh.map(
    (book) =>
      getBookshelfBookHitOutline({ book, row: rows.fresh, innerX, projection })
        .outline
  );
  const lovedOutlines = loved.map(
    (book) =>
      getBookshelfBookHitOutline({ book, row: rows.loved, innerX, projection })
        .outline
  );
  for (const [index, outline] of lovedOutlines.entries()) {
    assert.ok(
      freshOutlines.every((other) => !isInside(centerOf(outline), other)),
      `a new-arrivals book covers most-loved book ${index}`
    );
  }
  for (const [index, outline] of freshOutlines.entries()) {
    assert.ok(
      lovedOutlines.every((other) => !isInside(centerOf(outline), other)),
      `a most-loved book covers new-arrivals book ${index}`
    );
  }
});
