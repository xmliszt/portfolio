import { smoothstep } from "@/lib/paws/sim/smoothstep";
import { valueNoise } from "@/lib/paws/sim/value-noise";

import { getContext2d } from "./get-context-2d";
import type { CreateCanvas } from "./render-types";

const RX = 13;
const RY = 16;
const TEXELS_PER_UNIT = 5;
const RIDGE_GAP = 1.45;
const CORES = [
  { x: 1, y: -2 },
  { x: -2, y: 1 },
  { x: 2.5, y: 2 },
  { x: -1, y: -3.5 },
] as const;

/** Return whorl fingerprint `pattern` (its core and ridge wobble differ per pattern) drawn as ink on a transparent canvas, to be stretched over the fingertip's oval. */
export function createFingerprintTexture(options: {
  createCanvas: CreateCanvas;
  pattern: number;
}) {
  const core = CORES[options.pattern % CORES.length];
  const seed = options.pattern * 37;
  const width = RX * 2 * TEXELS_PER_UNIT;
  const height = RY * 2 * TEXELS_PER_UNIT;
  const canvas = options.createCanvas({ width, height });
  const g = getContext2d(canvas);
  const image = g.createImageData(width, height);
  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const X = px / TEXELS_PER_UNIT - RX;
      const Y = py / TEXELS_PER_UNIT - RY;
      const oval = (X / RX) ** 2 + (Y / RY) ** 2;
      const edge =
        1 -
        smoothstep(0.72, 1, oval + (valueNoise(X * 0.6, Y * 0.6) - 0.5) * 0.25);
      if (edge <= 0) continue;
      const warpX =
        (valueNoise(X * 0.2 + 3 + seed, Y * 0.2) - 0.5) * 2.4 +
        (valueNoise(X * 0.6 + 9, Y * 0.6) - 0.5) * 0.6;
      const warpY =
        (valueNoise(X * 0.2, Y * 0.2 + 7 + seed) - 0.5) * 2.4 +
        (valueNoise(X * 0.6, Y * 0.6 + 4) - 0.5) * 0.6;
      const x = X + warpX - core.x;
      const yRaw = Y + warpY - core.y;
      const y = yRaw > 0 ? yRaw * (1 + yRaw * 0.06) : yRaw;
      const radius = Math.hypot(x, y * 0.82);
      const spiral =
        (Math.atan2(y, x) / (Math.PI * 2)) *
        RIDGE_GAP *
        (1 - smoothstep(2.5, 6, radius));
      const ridge =
        0.5 + 0.5 * Math.cos((Math.PI * 2 * (radius + spiral)) / RIDGE_GAP);
      const broken =
        valueNoise(X * 1.4 + 21 + seed, Y * 1.4 + 5) > 0.7 ? 0.35 : 0;
      const threshold =
        0.55 + (valueNoise(X * 0.45 + 11, Y * 0.45) - 0.5) * 0.35 + broken;
      const ink = smoothstep(threshold, threshold + 0.18, ridge) * edge;
      const i = (py * width + px) * 4;
      image.data[i] = 120;
      image.data[i + 1] = 58;
      image.data[i + 2] = 52;
      image.data[i + 3] = Math.round(ink * 235);
    }
  }
  g.putImageData(image, 0, 0);
  return canvas;
}
