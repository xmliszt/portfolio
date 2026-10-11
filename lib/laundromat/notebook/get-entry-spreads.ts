import { getSpreadOfPage } from "./get-spread-of-page";

/** Return every spread an entry of `lineCount` lines from `lineStart` on `page` writes on, given `linesPerPage`. */
export function getEntrySpreads(options: {
  page: number;
  lineStart: number;
  lineCount: number;
  linesPerPage: number;
}) {
  const lastPage =
    options.page +
    Math.floor(
      (options.lineStart - 1 + options.lineCount - 1) / options.linesPerPage
    );
  const firstSpread = getSpreadOfPage(options.page);
  return Array.from(
    { length: getSpreadOfPage(lastPage) - firstSpread + 1 },
    (_, index) => firstSpread + index
  );
}
