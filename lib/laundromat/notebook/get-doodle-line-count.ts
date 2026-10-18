import type { DoodleStroke } from "./doodle-stroke";

/** Return the lines a doodle takes on the page: the rows down to its lowest point, between 1 and `maxRows`, plus one line for the timestamp. */
export function getDoodleLineCount(options: {
  strokes: DoodleStroke[];
  pitchPx: number;
  strokeWidthPx: number;
  maxRows: number;
}) {
  const bottomPx =
    Math.max(
      0,
      ...options.strokes.flatMap((stroke) => stroke.points.map(([, y]) => y))
    ) +
    options.strokeWidthPx / 2;
  const rows = Math.min(
    options.maxRows,
    Math.max(1, Math.ceil(bottomPx / options.pitchPx))
  );
  return rows + 1;
}
