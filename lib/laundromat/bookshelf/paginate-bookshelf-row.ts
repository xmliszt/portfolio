import { BOOKSHELF_GEOMETRY } from "./bookshelf-geometry";
import { getBookshelfBookSize } from "./get-bookshelf-book-size";

/** Split `bookIds` into pages, in order, each holding as many books as fit side by side in `width`; an empty list gives one empty page. */
export function paginateBookshelfRow(options: {
  bookIds: number[];
  width: number;
}) {
  return options.bookIds.reduce<number[][]>(
    (pages, id) => {
      const page = pages.at(-1) ?? [];
      const used = page.reduce(
        (sum, other) =>
          sum +
          getBookshelfBookSize(other).thickness +
          BOOKSHELF_GEOMETRY.bookGap,
        0
      );
      return used + getBookshelfBookSize(id).thickness <= options.width
        ? [...pages.slice(0, -1), [...page, id]]
        : [...pages, [id]];
    },
    [[]]
  );
}
