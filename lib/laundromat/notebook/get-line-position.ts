type GetLinePositionOptions = {
  lineIndex: number;
  linesPerPage: number;
};

/** Return the 1-based `page` and 0-based `row` of the book's 0-based `lineIndex`. */
export function getLinePosition(options: GetLinePositionOptions) {
  return {
    page: Math.floor(options.lineIndex / options.linesPerPage) + 1,
    row: options.lineIndex % options.linesPerPage,
  };
}
