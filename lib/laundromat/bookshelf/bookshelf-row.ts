export const BOOKSHELF_ROW_KEYS = ["loved", "fresh"] as const;

export type BookshelfRowKey = (typeof BOOKSHELF_ROW_KEYS)[number];

/** One shelf of the bookshelf: where its books stand and the board its label holder is screwed to. */
export type BookshelfRow = {
  key: BookshelfRowKey;
  floorZ: number;
  ceilingZ: number;
  boardZ: number;
  x0: number;
  x1: number;
  frontY: number;
};
