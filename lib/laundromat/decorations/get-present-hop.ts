const STAGES = [
  { kind: "flight", durationMs: 420, height: 1, tiltDeg: 5 },
  { kind: "landing", durationMs: 80, squash: 0.14 },
  { kind: "flight", durationMs: 170, height: 0.16, tiltDeg: -2 },
  { kind: "landing", durationMs: 60, squash: 0.05 },
] as const;

const STARTS_MS = STAGES.map((_, index) =>
  STAGES.slice(0, index).reduce((total, stage) => total + stage.durationMs, 0)
);

/** Return the present's lift (fraction of the peak height), tilt in degrees and vertical squash at `elapsedMs` after a tap: a jump, a landing, one small bounce, then rest. */
export function getPresentHop(options: { elapsedMs: number }) {
  const index = STAGES.findIndex(
    (stage, place) =>
      options.elapsedMs >= STARTS_MS[place] &&
      options.elapsedMs < STARTS_MS[place] + stage.durationMs
  );
  const stage = STAGES[index];
  if (!stage) return { lift: 0, tiltDeg: 0, squash: 0 };
  const t = (options.elapsedMs - STARTS_MS[index]) / stage.durationMs;
  const arc = Math.sin(t * Math.PI);
  return stage.kind === "flight"
    ? {
        lift: stage.height * 4 * t * (1 - t),
        tiltDeg: stage.tiltDeg * arc,
        squash: 0,
      }
    : { lift: 0, tiltDeg: 0, squash: stage.squash * arc };
}
