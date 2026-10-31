import { smoothstep } from "@/lib/paws/sim/smoothstep";
import { valueNoise } from "@/lib/paws/sim/value-noise";

import { getContext2d } from "./get-context-2d";
import type { FingerprintRidges } from "./get-fingerprint-style";
import type { CreateCanvas } from "./render-types";

const RX = 13;
const RY = 16;
const TEXELS_PER_UNIT = 5;

/** Return how far along the ridge field the point `x, y` (relative to the core) lies for `ridges`' family, in world units. */
function getRidgePhase(options: {
  ridges: FingerprintRidges;
  x: number;
  y: number;
}) {
  const { ridges, x, y } = options;
  switch (ridges.kind) {
    case "whorl": {
      const radius = Math.hypot(x, y * 0.82);
      const spiral =
        (Math.atan2(y, x) / (Math.PI * 2)) *
        ridges.gap *
        (1 - smoothstep(2.5, 6, radius));
      return radius + spiral;
    }
    case "loop": {
      const slanted = x + ridges.slant * y;
      return y < 0 ? Math.hypot(slanted, y * 0.9) : Math.abs(slanted);
    }
    case "arch": {
      const bulge = (3 + ridges.slant * 2) * (1 - smoothstep(-8, 12, y));
      return y + bulge * Math.exp(-(x * x) / 20);
    }
    default: {
      const unknown: never = ridges.kind;
      return unknown;
    }
  }
}

/** Return the fingerprint described by `ridges` (a whorl, loop or arch with its own core, ridge gap and wobble) drawn as ink on a transparent canvas, to be stretched over the fingertip's oval. */
export function createFingerprintTexture(options: {
  createCanvas: CreateCanvas;
  ridges: FingerprintRidges;
}) {
  const { ridges } = options;
  const seed = ridges.seed;
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
        smoothstep(
          0.72,
          1,
          oval + (valueNoise(X * 0.6 + seed, Y * 0.6) - 0.5) * 0.25
        );
      if (edge <= 0) continue;
      const warpX =
        (valueNoise(X * 0.2 + 3 + seed, Y * 0.2) - 0.5) * 2.4 +
        (valueNoise(X * 0.6 + 9, Y * 0.6 + seed) - 0.5) * 0.6;
      const warpY =
        (valueNoise(X * 0.2, Y * 0.2 + 7 + seed) - 0.5) * 2.4 +
        (valueNoise(X * 0.6 + seed, Y * 0.6 + 4) - 0.5) * 0.6;
      const x = X + warpX - ridges.coreX;
      const yRaw = Y + warpY - ridges.coreY;
      const y = yRaw > 0 ? yRaw * (1 + yRaw * 0.06) : yRaw;
      const phase = getRidgePhase({ ridges, x, y });
      const ridge = 0.5 + 0.5 * Math.cos((Math.PI * 2 * phase) / ridges.gap);
      const broken =
        valueNoise(X * 1.4 + 21 + seed, Y * 1.4 + 5) > 0.7 ? 0.35 : 0;
      const threshold =
        0.55 +
        (valueNoise(X * 0.45 + 11, Y * 0.45 + seed) - 0.5) * 0.35 +
        broken;
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
