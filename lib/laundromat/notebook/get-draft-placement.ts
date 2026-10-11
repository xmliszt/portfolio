type GetDraftPlacementOptions = {
  linesUsed: number;
  lineCount: number;
  linesPerPage: number;
  pageCount: number;
};

/** Return where a draft of `lineCount` lines lands: its first line, the page of its last text line, and `startsNewBook` when it no longer fits after `linesUsed` and moves to page 1 of the next book, as `append_entry` places it. */
export function getDraftPlacement(options: GetDraftPlacementOptions) {
  const capacity = options.pageCount * options.linesPerPage;
  const startsNewBook = options.linesUsed + options.lineCount > capacity;
  const firstLine = startsNewBook ? 0 : options.linesUsed;
  const lastTextLine = firstLine + Math.max(0, options.lineCount - 2);
  return {
    startsNewBook,
    page: Math.floor(firstLine / options.linesPerPage) + 1,
    lineStart: (firstLine % options.linesPerPage) + 1,
    caretPage: Math.min(
      options.pageCount,
      Math.floor(lastTextLine / options.linesPerPage) + 1
    ),
  };
}
