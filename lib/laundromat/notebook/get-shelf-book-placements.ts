import type { IsoPoint, IsoSize } from "@/lib/laundromat/scene-config";

const BOARD_THICKNESS = 0.08;
const FIRST_BOOK_OFFSET = 0.14;
const BOOK_GAP = 0.01;
const BOOK_INSET = 0.06;
const BOOK_SIZES = [
  { thickness: 0.16, height: 1.18, depth: 0.58 },
  { thickness: 0.19, height: 1.3, depth: 0.62 },
  { thickness: 0.14, height: 1.06, depth: 0.54 },
  { thickness: 0.18, height: 1.24, depth: 0.6 },
  { thickness: 0.15, height: 1.36, depth: 0.62 },
  { thickness: 0.2, height: 1.12, depth: 0.56 },
  { thickness: 0.16, height: 1.28, depth: 0.6 },
  { thickness: 0.17, height: 1.2, depth: 0.58 },
  { thickness: 0.15, height: 1.1, depth: 0.56 },
];

export type ShelfBookPlacement = {
  number: number;
  x0: number;
  x1: number;
  y: number;
  thickness: number;
  z0: number;
  z1: number;
  lean: number;
};

type GetShelfBookPlacementsOptions = {
  shelf: { position: IsoPoint; size: IsoSize };
  bookNumbers: number[];
  lean: number;
};

/** Return where each filled book stands on the shelf, left to right in `bookNumbers` order, keeping only the newest books that fit and leaning the last one when there is room. */
export function getShelfBookPlacements(
  options: GetShelfBookPlacementsOptions
): ShelfBookPlacement[] {
  const { position: p, size } = options.shelf;
  const boardTop = p.z + BOARD_THICKNESS;
  const shelfEnd = p.y + size.d - FIRST_BOOK_OFFSET;
  const sizes = options.bookNumbers.map((number, index) => ({
    number,
    ...BOOK_SIZES[index % BOOK_SIZES.length],
  }));
  const fitting = sizes.reduceRight<typeof sizes>((kept, book) => {
    const used = kept.reduce(
      (sum, { thickness }) => sum + thickness + BOOK_GAP,
      0
    );
    return p.y + FIRST_BOOK_OFFSET + used + book.thickness + options.lean <=
      shelfEnd
      ? [book, ...kept]
      : kept;
  }, []);
  return fitting.reduce<ShelfBookPlacement[]>((placed, book, index) => {
    const previous = placed.at(-1);
    const y =
      previous === undefined
        ? p.y + FIRST_BOOK_OFFSET
        : previous.y - previous.lean + previous.thickness + BOOK_GAP;
    const lean =
      index === fitting.length - 1 && fitting.length > 1 ? options.lean : 0;
    return [
      ...placed,
      {
        number: book.number,
        x0: p.x + BOOK_INSET,
        x1: p.x + BOOK_INSET + book.depth,
        y: y + lean,
        thickness: book.thickness,
        z0: boardTop,
        z1: boardTop + Math.min(book.height, size.h - BOARD_THICKNESS),
        lean,
      },
    ];
  }, []);
}
