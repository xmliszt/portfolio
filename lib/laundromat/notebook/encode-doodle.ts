import type { DoodleDrawing, DoodleStroke } from "./doodle-stroke";

/** Return `strokes` drawn `widthPx` wide as a `DoodleDrawing`: each point rounded to half a pixel and stored as the change from the point before it. */
export function encodeDoodle(options: {
  strokes: DoodleStroke[];
  widthPx: number;
}): DoodleDrawing {
  return {
    w: options.widthPx,
    strokes: options.strokes.map((stroke) => {
      const halves = stroke.points.map(
        ([x, y]) =>
          [Math.round(x * 2), Math.round(y * 2)] satisfies [number, number]
      );
      const deltas = halves.flatMap(([x, y], index) => {
        const previous = halves.at(index - 1);
        return index === 0 || previous === undefined
          ? [x, y]
          : [x - previous[0], y - previous[1]];
      });
      return [Math.round(stroke.durationMs), ...deltas];
    }),
  };
}
