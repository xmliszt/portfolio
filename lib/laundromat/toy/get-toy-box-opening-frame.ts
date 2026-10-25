import { cubicBezier, easeInOut } from "motion";

const fallEase = cubicBezier(0.55, 0, 0.9, 0.45);

function progress(options: { elapsedMs: number; durationMs: number }) {
  return options.durationMs === 0
    ? 1
    : Math.max(0, Math.min(1, options.elapsedMs / options.durationMs));
}

export function getToyBoxOpeningFrame(options: {
  elapsedMs: number;
  lidFallMs: number;
  boxFadeMs: number;
  reducedMotion: boolean;
}) {
  const fallMs = options.reducedMotion ? 0 : options.lidFallMs;
  return {
    lidAngleDeg: options.reducedMotion
      ? 0
      : 90 *
        fallEase(
          progress({ elapsedMs: options.elapsedMs, durationMs: fallMs })
        ),
    setOpacity: easeInOut(
      progress({
        elapsedMs: options.elapsedMs - fallMs,
        durationMs: options.boxFadeMs,
      })
    ),
  };
}
