import { BOOKSHELF_GEOMETRY as G } from "./bookshelf-geometry";
import type { BookshelfRow } from "./bookshelf-row";
import { getBookshelfBookSize } from "./get-bookshelf-book-size";

export type BookshelfBookPlacement = {
  id: number;
  x0: number;
  x1: number;
  backY: number;
  frontY: number;
  z0: number;
  z1: number;
  isHardcover: boolean;
  toneIndex: number;
  hue: number;
};

/** Return where each book in `bookIds` stands on `row`, left to right in order, with its spine facing the front. */
export function getBookshelfBookPlacements(options: {
  row: BookshelfRow;
  bookIds: number[];
}) {
  const { row } = options;
  const maxHeight = row.ceilingZ - row.floorZ - G.bookClearance;
  return options.bookIds.reduce<BookshelfBookPlacement[]>((placed, id) => {
    const size = getBookshelfBookSize(id);
    const x0 =
      placed.at(-1) === undefined
        ? row.x0
        : (placed.at(-1)?.x1 ?? row.x0) + G.bookGap;
    const frontY = row.frontY - G.bookFrontSetback - size.setback;
    return [
      ...placed,
      {
        id,
        x0,
        x1: x0 + size.thickness,
        backY: frontY - size.depth,
        frontY,
        z0: row.floorZ,
        z1: row.floorZ + Math.min(size.height, maxHeight),
        isHardcover: size.isHardcover,
        toneIndex: size.toneIndex,
        hue: size.hue,
      },
    ];
  }, []);
}
