import type { IsoPoint, IsoSize } from "@/lib/laundromat/scene-config";

import { BOOKSHELF_GEOMETRY as G } from "./bookshelf-geometry";
import type { BookshelfRow } from "./bookshelf-row";

const HALF_WIDTH = 0.44;
const HEIGHT = 0.19;
const ARROW_SIZE = 0.16;
const ARROW_GAP = 0.04;

/** Return the world-unit box of `row`'s label holder on the front of its board, and of the previous and next page tabs on either side of it. */
export function getBookshelfLabelHolder(options: {
  row: BookshelfRow;
  position: IsoPoint;
  size: IsoSize;
}) {
  const centerX = options.position.x + options.size.w / 2;
  const z1 = options.row.boardZ + G.board + 0.01;
  const z0 = z1 - HEIGHT;
  const plate = { x0: centerX - HALF_WIDTH, x1: centerX + HALF_WIDTH, z0, z1 };
  const arrowZ0 = (z0 + z1) / 2 - ARROW_SIZE / 2;
  return {
    y: options.row.frontY + 0.014,
    plate,
    previous: {
      x0: plate.x0 - ARROW_GAP - ARROW_SIZE,
      x1: plate.x0 - ARROW_GAP,
      z0: arrowZ0,
      z1: arrowZ0 + ARROW_SIZE,
    },
    next: {
      x0: plate.x1 + ARROW_GAP,
      x1: plate.x1 + ARROW_GAP + ARROW_SIZE,
      z0: arrowZ0,
      z1: arrowZ0 + ARROW_SIZE,
    },
  };
}
