import type { BookshelfRowKey } from "./bookshelf-row";

/** Return the scene id of shelf `row`'s previous or next page tab. */
export function getBookshelfTabId(options: {
  row: BookshelfRowKey;
  side: "previous" | "next";
}) {
  return `bookshelf-${options.row}-${options.side}`;
}
