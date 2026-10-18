/** One pen stroke of a doodle, in page pixels from the doodle's top-left corner; a stroke of one point is a dot. */
export type DoodleStroke = {
  points: [number, number][];
  durationMs: number;
};

/** A doodle as stored in `notebook_entries.drawing`: the width it was drawn at and each stroke as `[durationMs, x, y, dx, dy, …]` in half pixels. */
export type DoodleDrawing = {
  w: number;
  strokes: number[][];
};
