import type { IsoPoint, IsoSize } from "@/lib/laundromat/scene-config";

import { BOOKSHELF_GEOMETRY as G } from "./bookshelf-geometry";
import type { BookshelfRow } from "./bookshelf-row";

/** Return the two shelves of a bookshelf at `position` with `size`: `loved` on the middle board, `fresh` on the bottom board. */
export function getBookshelfRows(options: {
  position: IsoPoint;
  size: IsoSize;
}) {
  const { position: p, size } = options;
  const top = p.z + size.h - G.slab;
  const middleZ = p.z + G.kick + (size.h - G.slab - G.kick) / 2 - G.board / 2;
  const x0 = p.x + G.side + G.bookInsetStart;
  const x1 = p.x + size.w - G.side - G.bookendRoom;
  const frontY = p.y + size.d - G.overhang;
  const fresh: BookshelfRow = {
    key: "fresh",
    floorZ: p.z + G.kick + G.board,
    ceilingZ: middleZ,
    boardZ: p.z + G.kick,
    x0,
    x1,
    frontY,
  };
  const loved: BookshelfRow = {
    key: "loved",
    floorZ: middleZ + G.board,
    ceilingZ: top - G.apronDrop,
    boardZ: middleZ,
    x0,
    x1,
    frontY,
  };
  return { loved, fresh, top, middleZ };
}
