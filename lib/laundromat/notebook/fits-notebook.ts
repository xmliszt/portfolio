/** Return `true` if an entry starting at `page` and `lineStart` with `lineCount` lines lies inside a notebook of `pageCount` pages of `linesPerPage` lines and spans at most two pages; `false` when it does not. */
export function fitsNotebook(options: {
  page: number;
  lineStart: number;
  lineCount: number;
  linesPerPage: number;
  pageCount: number;
}) {
  const { page, lineStart, lineCount, linesPerPage, pageCount } = options;
  const endLine = (page - 1) * linesPerPage + lineStart - 1 + lineCount;
  return (
    page >= 1 &&
    lineStart >= 1 &&
    lineStart <= linesPerPage &&
    lineCount >= 1 &&
    lineCount <= 2 * linesPerPage &&
    endLine <= pageCount * linesPerPage
  );
}
