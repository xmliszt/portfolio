import { DOODLE_LIMITS } from "./doodle-limits";
import type { DoodleDrawing } from "./doodle-stroke";
import { getDoodleArea } from "./get-doodle-area";

function isIntegerList(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((item) => Number.isInteger(item));
}

function isStrokeWithinLimits(options: {
  stroke: number[];
  widthHalfPx: number;
  heightHalfPx: number;
}) {
  const [durationMs, ...deltas] = options.stroke;
  if (durationMs < 0 || durationMs > DOODLE_LIMITS.maxStrokeMs) return false;
  const point = { x: 0, y: 0 };
  return deltas.every((delta, index) => {
    const axis = index % 2 === 0 ? "x" : "y";
    point[axis] += delta;
    const max = axis === "x" ? options.widthHalfPx : options.heightHalfPx;
    return point[axis] >= 0 && point[axis] <= max;
  });
}

/** Return `value` as a `DoodleDrawing`, or `undefined` when it is not one: drawn at another width than the drawing space, a stroke that is not a duration plus whole x/y pairs, a point outside the drawing space, or more than `DOODLE_LIMITS` allows. */
export function parseDoodleDrawing(value: unknown): DoodleDrawing | undefined {
  const area = getDoodleArea();
  if (
    typeof value !== "object" ||
    value === null ||
    !("w" in value && value.w === area.widthPx) ||
    !("strokes" in value && Array.isArray(value.strokes))
  ) {
    return undefined;
  }
  const strokes = value.strokes.filter(isIntegerList);
  const pointCount = strokes.reduce(
    (total, stroke) => total + (stroke.length - 1) / 2,
    0
  );
  if (
    strokes.length !== value.strokes.length ||
    strokes.length === 0 ||
    strokes.length > DOODLE_LIMITS.maxStrokes ||
    pointCount > DOODLE_LIMITS.maxPoints ||
    strokes.some((stroke) => stroke.length < 3 || stroke.length % 2 === 0) ||
    !strokes.every((stroke) =>
      isStrokeWithinLimits({
        stroke,
        widthHalfPx: area.widthPx * 2,
        heightHalfPx: Math.ceil(area.heightPx * 2),
      })
    )
  ) {
    return undefined;
  }
  return { w: area.widthPx, strokes };
}
