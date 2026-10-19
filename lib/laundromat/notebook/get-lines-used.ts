import { isEntryHidden } from "./is-entry-hidden";

type GetLinesUsedOptions = {
  linesUsed: number;
  linesPerPage: number;
  entries: ({ page: number; lineStart: number; lineCount: number } & (
    | { kind: "text"; body: string }
    | { kind: "doodle"; drawing: unknown }
  ))[];
};

/** Return how many lines the notebook has used: the stored `linesUsed`, or the end of the last visible entry in `entries` when that runs further. */
export function getLinesUsed(options: GetLinesUsedOptions) {
  const lastEntry = options.entries.findLast((entry) => !isEntryHidden(entry));
  if (lastEntry === undefined) return options.linesUsed;
  return Math.max(
    options.linesUsed,
    (lastEntry.page - 1) * options.linesPerPage +
      lastEntry.lineStart -
      1 +
      lastEntry.lineCount
  );
}
