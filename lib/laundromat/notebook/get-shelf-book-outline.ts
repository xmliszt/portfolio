import type { IsoProjection, ScreenPoint } from "@/lib/laundromat/project-iso-point";
import { projectIsoPoint } from "@/lib/laundromat/project-iso-point";

import type { ShelfBookPlacement } from "./get-shelf-book-placements";

type GetShelfBookOutlineOptions = {
  book: ShelfBookPlacement;
  projection: IsoProjection;
};

/** Return the scene-pixel `outline` of a shelf book's visible front, spine and top, and its `bounds`. */
export function getShelfBookOutline(options: GetShelfBookOutlineOptions) {
  const { book, projection } = options;
  function at(x: number, y: number, z: number) {
    return projectIsoPoint({ point: { x, y, z }, projection });
  }
  const topY = book.y - book.lean;
  const outline: ScreenPoint[] = [
    at(book.x0, book.y + book.thickness, book.z0),
    at(book.x1, book.y + book.thickness, book.z0),
    at(book.x1, book.y, book.z0),
    at(book.x1, topY, book.z1),
    at(book.x0, topY, book.z1),
    at(book.x0, topY + book.thickness, book.z1),
  ];
  const xs = outline.map((point) => point.x);
  const ys = outline.map((point) => point.y);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return {
    outline,
    bounds: { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y },
  };
}
