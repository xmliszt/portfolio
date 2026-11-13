import type { IsoPoint, IsoSize } from "@/lib/laundromat/scene-config";

import { BOOKSHELF_GEOMETRY as G } from "./bookshelf-geometry";

/** Return the x of the inside faces of the bookshelf's left and right side panels. */
export function getBookshelfInnerX(options: {
  position: IsoPoint;
  size: IsoSize;
}) {
  return {
    left: options.position.x + G.side,
    right: options.position.x + options.size.w - G.side,
  };
}
