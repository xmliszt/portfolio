import { clipConvexPolygon } from "@/lib/laundromat/clip-convex-polygon";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";

import type { BookshelfRow } from "./bookshelf-row";
import { getBookshelfBookOutline } from "./get-bookshelf-book-outline";
import type { BookshelfBookPlacement } from "./get-bookshelf-book-placements";
import { getBookshelfRowOpening } from "./get-bookshelf-row-opening";

/** Return the scene-pixel outline of the part of a resting `book` seen through its row's open front, and its `bounds`. */
export function getBookshelfBookHitOutline(options: {
  book: BookshelfBookPlacement;
  row: BookshelfRow;
  innerX: { left: number; right: number };
  projection: IsoProjection;
}) {
  const outline = clipConvexPolygon({
    subject: getBookshelfBookOutline({
      book: options.book,
      projection: options.projection,
    }).outline,
    clip: getBookshelfRowOpening({
      row: options.row,
      leftX: options.innerX.left,
      rightX: options.innerX.right,
      projection: options.projection,
    }),
  });
  const xs = outline.map((point) => point.x);
  const ys = outline.map((point) => point.y);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return {
    outline,
    bounds: { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y },
  };
}
