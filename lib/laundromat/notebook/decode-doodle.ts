import type { DoodleDrawing, DoodleStroke } from "./doodle-stroke";

/** Return the strokes of `drawing` in page pixels, scaled from the width it was drawn at to `widthPx`. */
export function decodeDoodle(options: {
  drawing: DoodleDrawing;
  widthPx: number;
}): DoodleStroke[] {
  const scale = options.widthPx / options.drawing.w / 2;
  return options.drawing.strokes.map(([durationMs, ...deltas]) => {
    const points = deltas
      .filter((_, index) => index % 2 === 0)
      .reduce<[number, number][]>((acc, dx, index) => {
        const dy = deltas[index * 2 + 1];
        const previous = acc.at(-1) ?? [0, 0];
        return [...acc, [previous[0] + dx, previous[1] + dy]];
      }, []);
    return {
      durationMs: Math.max(0, durationMs),
      points: points.map(([x, y]) => [x * scale, y * scale]),
    };
  });
}
