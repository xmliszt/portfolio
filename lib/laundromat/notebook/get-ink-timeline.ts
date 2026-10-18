import type { DoodleStroke } from "./doodle-stroke";
import { getStrokeLength } from "./get-stroke-length";

/** Return when each of `strokes` starts and how long it takes to ink: its length at `speedPxPerMs` (at least `minStrokeMs`) with `gapMs` between strokes, all scaled down by one factor when the total would pass `maxDurationMs`. */
export function getInkTimeline(options: {
  strokes: DoodleStroke[];
  speedPxPerMs: number;
  minStrokeMs: number;
  gapMs: number;
  maxDurationMs: number;
}) {
  const durationsMs = options.strokes.map((stroke) =>
    Math.max(
      options.minStrokeMs,
      getStrokeLength(stroke.points) / options.speedPxPerMs
    )
  );
  const totalMs =
    durationsMs.reduce((sum, durationMs) => sum + durationMs, 0) +
    options.gapMs * Math.max(0, durationsMs.length - 1);
  const scale =
    totalMs > options.maxDurationMs ? options.maxDurationMs / totalMs : 1;
  return durationsMs.reduce<{ delayMs: number; durationMs: number }[]>(
    (items, durationMs) => {
      const previous = items.at(-1);
      const delayMs =
        previous === undefined
          ? 0
          : previous.delayMs + previous.durationMs + options.gapMs * scale;
      return [...items, { delayMs, durationMs: durationMs * scale }];
    },
    []
  );
}
