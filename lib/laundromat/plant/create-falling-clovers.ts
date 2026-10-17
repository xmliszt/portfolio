import { randomBetween } from "@/lib/laundromat/audio/sounds/random-between";

export type FallingClover = {
  x: number;
  stillY: number;
  sizePx: number;
  depth: number;
  delayS: number;
  fallS: number;
  swayPx: number;
  swayHz: number;
  swayPhase: number;
  driftPxPerS: number;
  rotation: number;
  spin: number;
  flipHz: number;
  flipPhase: number;
  shade: number;
};

const SPAWN_S = 2.6;
const OPENING_BURST_SKEW = 1.6;
const REFERENCE_HEIGHT_PX = 800;

/** Return `count` clovers with random start, size, depth, timing, sway and spin for a shower over a `viewport`-sized screen. */
export function createFallingClovers(options: {
  count: number;
  viewport: { width: number; height: number };
  shadeCount: number;
  random?: () => number;
}) {
  const random = options.random ?? Math.random;
  const { width, height } = options.viewport;
  const heightScale = Math.sqrt(
    Math.min(1.6, Math.max(0.6, height / REFERENCE_HEIGHT_PX))
  );
  function between(min: number, max: number) {
    return randomBetween({ min, max, random });
  }
  return Array.from({ length: options.count }, (): FallingClover => {
    const depth = random();
    return {
      x: between(-0.05, 1.05) * width,
      stillY: between(0.08, 0.92) * height,
      sizePx: (14 + 32 * depth) * between(0.85, 1.15),
      depth,
      delayS: SPAWN_S * random() ** OPENING_BURST_SKEW,
      fallS: (5.4 - 2.6 * depth) * between(0.85, 1.2) * heightScale,
      swayPx: between(10, 50) * (0.5 + 0.5 * depth),
      swayHz: between(0.15, 0.55),
      swayPhase: between(0, Math.PI * 2),
      driftPxPerS: between(-30, 30),
      rotation: between(0, Math.PI * 2),
      spin: (random() < 0.5 ? -1 : 1) * between(0.4, 3),
      flipHz: between(0.2, 1.2),
      flipPhase: between(0, Math.PI * 2),
      shade: Math.floor(random() * options.shadeCount),
    };
  });
}
