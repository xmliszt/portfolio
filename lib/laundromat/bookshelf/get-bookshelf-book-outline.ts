import { getConvexHull } from "@/lib/laundromat/get-convex-hull";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import { projectIsoPoint } from "@/lib/laundromat/project-iso-point";

import type { BookshelfBookPlacement } from "./get-bookshelf-book-placements";

/** Return the scene-pixel outline of a book box between `fromY` and its front, and its `bounds`; by default the whole book as it rests on the shelf. */
export function getBookshelfBookOutline(options: {
  book: BookshelfBookPlacement;
  projection: IsoProjection;
  fromY?: number;
}) {
  const { book, projection } = options;
  const fromY = options.fromY ?? book.backY;
  const corners = [book.x0, book.x1].flatMap((x) =>
    [fromY, book.frontY].flatMap((y) =>
      [book.z0, book.z1].map((z) =>
        projectIsoPoint({ point: { x, y, z }, projection })
      )
    )
  );
  const outline = getConvexHull(corners);
  const xs = outline.map((point) => point.x);
  const ys = outline.map((point) => point.y);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return {
    outline,
    bounds: { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y },
  };
}
