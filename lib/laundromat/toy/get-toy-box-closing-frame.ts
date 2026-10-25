import type { getToyBoxOpeningFrame } from "./get-toy-box-opening-frame";

export function getToyBoxClosingFrame(options: {
  opening: ReturnType<typeof getToyBoxOpeningFrame>;
  elapsedMs: number;
  lidFallMs: number;
  boxFadeMs: number;
  durationMs: number;
}) {
  function remaining(durationMs: number) {
    return (
      1 -
      Math.max(
        0,
        Math.min(
          options.elapsedMs /
            Math.max(1, Math.min(options.durationMs, durationMs)),
          1
        )
      )
    );
  }
  return {
    setOpacity: options.opening.setOpacity * remaining(options.boxFadeMs),
    lidAngleDeg: options.opening.lidAngleDeg * remaining(options.lidFallMs),
  };
}
