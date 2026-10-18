/** Return the `page` and `lineStart` where a doodle of `spaceLineCount` lines lands after `linesUsed`, moving to the next page when it does not fit and to the next book (`startsNewBook`) when the book is full. */
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
