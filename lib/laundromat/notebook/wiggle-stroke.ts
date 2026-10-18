import type { DoodleStroke } from "./doodle-stroke";

function unitRandom(seed: number) {
  let z = seed >>> 0;
  z = Math.imul(z ^ (z >>> 16), 0x85ebca6b);
  z = Math.imul(z ^ (z >>> 13), 0xc2b2ae35);
  z ^= z >>> 16;
  return (z >>> 0) / 2 ** 32;
}

function getOffset(options: {
  seed: number;
  frame: number;
  amplitudePx: number;
}) {
  const seed =
    Math.imul(options.seed, 0x9e3779b1) ^
    Math.imul(options.frame + 1, 0x85ebca77);
  const angle = unitRandom(seed) * 2 * Math.PI;
  const magnitude =
    (0.35 + 0.65 * unitRandom(seed ^ 0x27d4eb2f)) * options.amplitudePx;
  return [Math.cos(angle) * magnitude, Math.sin(angle) * magnitude];
}

/** Return a copy of `stroke` with each point moved up to `amplitudePx` in a direction fixed by its index, `strokeIndex` and `frame`, so the same frame always gives the same points. */
export function wiggleStroke(options: {
  stroke: DoodleStroke;
  strokeIndex: number;
  frame: number;
  amplitudePx: number;
}): DoodleStroke {
  const { stroke } = options;
  const baseSeed = Math.imul(options.strokeIndex, 1_000_003);
  return {
    ...stroke,
    points: stroke.points.map(([x, y], index) => {
      const [dx, dy] = getOffset({
        seed: baseSeed + index,
        frame: options.frame,
        amplitudePx: options.amplitudePx,
      });
      return [x + dx, y + dy];
    }),
  };
}
