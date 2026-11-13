import type { BookshelfRowKey } from "./bookshelf-row";

/** Return the scene id of book `bookId` on shelf `row`. */
export function getBookshelfBookId(options: {
  row: BookshelfRowKey;
  bookId: number;
}) {
  return `bookshelf-${options.row}-${options.bookId}`;
}
