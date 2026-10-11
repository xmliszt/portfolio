import { wrapEntryLines } from "./wrap-entry-lines";

/** Return the lines `text` occupies when each line is at most `maxWidthPx` wide by `measure`, breaking at spaces and between CJK characters, and inside a word only when it is wider than a line. */
export function wrapEntryText(options: {
  text: string;
  maxWidthPx: number;
  measure: (text: string) => number;
}) {
  return wrapEntryLines(options).map((line) => line.text);
}
