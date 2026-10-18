import type { DoodleDrawing, DoodleStroke } from "./doodle-stroke";

/** Return the strokes of `drawing` in page pixels, scaled from the width it was drawn at to `widthPx`. */
export function decodeDoodle(options: {
  drawing: DoodleDrawing;
  widthPx: number;
}): DoodleStroke[] {
  const scale = options.widthPx / options.drawing.w / 2;
  return options.drawing.strokes.map(([durationMs, ...deltas]) => {
    const points = deltas.reduce<[number, number][]>((acc, delta, index) => {
      if (index % 2 === 1) return acc;
      const [x, y] = acc.at(-1) ?? [0, 0];
      acc.push([x + delta, y + deltas[index + 1]]);
      return acc;
    }, []);
    return {
      durationMs: Math.max(0, durationMs),
      points: points.map(([x, y]) => [x * scale, y * scale]),
    };
  });
}
