import type { EnvelopePoint } from "./get-envelope-points";

/** Schedule `points` on `param`, replacing anything scheduled from the first point onward. */
export function applyEnvelope(options: {
  param: AudioParam;
  points: EnvelopePoint[];
}) {
  const first = options.points.at(0);
  if (!first) return;
  options.param.cancelScheduledValues(first.timeS);
  options.points.forEach((point) => {
    switch (point.ramp) {
      case "set":
        options.param.setValueAtTime(point.value, point.timeS);
        return;
      case "linear":
        options.param.linearRampToValueAtTime(point.value, point.timeS);
        return;
      case "exponential":
        options.param.exponentialRampToValueAtTime(point.value, point.timeS);
        return;
      default: {
        const unknownRamp: never = point.ramp;
        throw new Error(`Unknown ramp ${String(unknownRamp)}`);
      }
    }
  });
}
