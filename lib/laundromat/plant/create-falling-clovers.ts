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
  return Array.from({ length: options.count }, (): FallingClover => {
    const depth = random();
    return {
      x: randomBetween({ min: -0.05, max: 1.05, random }) * width,
      stillY: randomBetween({ min: 0.08, max: 0.92, random }) * height,
      sizePx:
        (14 + 32 * depth) * randomBetween({ min: 0.85, max: 1.15, random }),
      depth,
      delayS: SPAWN_S * random() ** OPENING_BURST_SKEW,
      fallS:
        (5.4 - 2.6 * depth) *
        randomBetween({ min: 0.85, max: 1.2, random }) *
        heightScale,
      swayPx: randomBetween({ min: 10, max: 50, random }) * (0.5 + 0.5 * depth),
      swayHz: randomBetween({ min: 0.15, max: 0.55, random }),
      swayPhase: randomBetween({ min: 0, max: Math.PI * 2, random }),
      driftPxPerS: randomBetween({ min: -30, max: 30, random }),
      rotation: randomBetween({ min: 0, max: Math.PI * 2, random }),
      spin:
        (random() < 0.5 ? -1 : 1) * randomBetween({ min: 0.4, max: 3, random }),
      flipHz: randomBetween({ min: 0.2, max: 1.2, random }),
      flipPhase: randomBetween({ min: 0, max: Math.PI * 2, random }),
      shade: Math.floor(random() * options.shadeCount),
    };
  });
}
