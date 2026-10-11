export type EnvelopePoint = {
  timeS: number;
  value: number;
  ramp: "set" | "linear" | "exponential";
};

// Web Audio exponential ramps cannot start from or reach 0.
export const ENVELOPE_FLOOR = 0.0001;

/** Return the points of an attack, hold, exponential-decay envelope starting at `startTimeS` and peaking at `peak`. */
export function getEnvelopePoints(options: {
  startTimeS: number;
  attackMs: number;
  holdMs?: number;
  decayMs: number;
  peak: number;
}) {
  const peak = Math.max(options.peak, ENVELOPE_FLOOR);
  const peakTimeS = options.startTimeS + options.attackMs / 1000;
  const holdEndTimeS = peakTimeS + (options.holdMs ?? 0) / 1000;
  const endTimeS = holdEndTimeS + options.decayMs / 1000;
  return [
    { timeS: options.startTimeS, value: ENVELOPE_FLOOR, ramp: "set" },
    { timeS: peakTimeS, value: peak, ramp: "linear" },
    { timeS: holdEndTimeS, value: peak, ramp: "set" },
    { timeS: endTimeS, value: ENVELOPE_FLOOR, ramp: "exponential" },
  ] satisfies EnvelopePoint[];
}
