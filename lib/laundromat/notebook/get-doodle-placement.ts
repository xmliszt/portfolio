/** Return where a doodle lands after `linesUsed`, as `append_doodle` places it: on the next free line when its drawing space of `spaceLineCount` lines fits on that page, otherwise at the top of the next page, and on page 1 of the next book with `startsNewBook` when the book has no room for that space. */
export function getDoodlePlacement(options: {
  linesUsed: number;
  spaceLineCount: number;
  linesPerPage: number;
  pageCount: number;
}) {
  const { linesUsed, spaceLineCount, linesPerPage } = options;
  const row = linesUsed % linesPerPage;
  const skip = row + spaceLineCount > linesPerPage ? linesPerPage - row : 0;
  const startsNewBook =
    linesUsed + skip + spaceLineCount > options.pageCount * linesPerPage;
  const firstLine = startsNewBook ? 0 : linesUsed + skip;
  return {
    startsNewBook,
    isMoved: skip > 0 && !startsNewBook,
    page: Math.floor(firstLine / linesPerPage) + 1,
    lineStart: (firstLine % linesPerPage) + 1,
  };
}
