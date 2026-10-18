import type { DoodleDrawing } from "./doodle-stroke";

const MAX_STROKES = 400;
const MAX_POINTS = 4000;

function isIntegerList(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((item) => Number.isInteger(item));
}

/** Return `value` as a `DoodleDrawing`, or `undefined` when it is not one: no positive width, no strokes, a stroke that is not a duration plus whole x/y pairs, or more than the stroke and point limits. */
export function parseDoodleDrawing(value: unknown): DoodleDrawing | undefined {
  if (
    typeof value !== "object" ||
    value === null ||
    !("w" in value && typeof value.w === "number" && value.w > 0) ||
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
    strokes.length > MAX_STROKES ||
    pointCount > MAX_POINTS ||
    strokes.some((stroke) => stroke.length < 3 || stroke.length % 2 === 0)
  ) {
    return undefined;
  }
  return { w: value.w, strokes };
}
