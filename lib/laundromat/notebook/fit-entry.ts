import { getEntryLineCount } from "./get-entry-line-count";
import { wrapEntryText } from "./wrap-entry-text";

const MAX_PAGES_PER_ENTRY = 2;

type FitEntryOptions = {
  text: string;
  maxWidthPx: number;
  measure: (text: string) => number;
  linesPerPage: number;
};

/** Return the wrapped `lines` of `text`, the `lineCount` sent to `append_entry`, and `fits` when that count is within the two pages an entry may span. */
export function fitEntry(options: FitEntryOptions) {
  const lines = wrapEntryText(options);
  const lineCount = getEntryLineCount(lines.length);
  return {
    lines,
    lineCount,
    fits: lineCount <= MAX_PAGES_PER_ENTRY * options.linesPerPage,
  };
}
