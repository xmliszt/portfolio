import { clamp } from "@/lib/paws/sim/clamp";
import { lerp } from "@/lib/paws/sim/lerp";
import { smoothstep } from "@/lib/paws/sim/smoothstep";
import { valueNoise } from "@/lib/paws/sim/value-noise";

import { getContext2d } from "./get-context-2d";
import { TOE_BEANS } from "./paw-pad-shapes";
import { PAW_PRINT_BOX } from "./paw-print-box";
import type { AnyCanvas, CreateCanvas } from "./render-types";

const pawDistance = (x: number, y: number) => {
  const ellipse = (
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    rotation: number
  ) => {
    const cos = Math.cos(-rotation);
    const sin = Math.sin(-rotation);
    const dx = x - cx;
    const dy = y - cy;
    const u = dx * cos - dy * sin;
    const v = dx * sin + dy * cos;
    const taper = ry * (1 + 0.16 * clamp(u / rx, -1, 1));
    return (Math.hypot(u / rx, v / taper) - 1) * Math.min(rx, taper);
  };
  const smoothMin = (a: number, b: number, blend: number) => {
    const t = clamp(0.5 + (0.5 * (b - a)) / blend, 0, 1);
    return lerp(b, a, t) - blend * t * (1 - t);
  };
  const toes = Math.min(
    ...TOE_BEANS.map(([cx, cy, rx, ry, rotation]) =>
      ellipse(cx, cy, rx, ry, rotation)
    )
  );
  const main = [
    ellipse(-7.6, -5.4, 3.2, 3.3, 0),
    ellipse(-8.8, 0, 3.4, 3.4, 0),
    ellipse(-7.6, 5.4, 3.2, 3.3, 0),
  ].reduce(
    (shape, lobe) => smoothMin(shape, lobe, 1),
    ellipse(-2.8, 0, 4.4, 7.4, 0)
  );
  return Math.min(toes, main);
};

/** Return the inked paw print masks, one per variant, each a slightly different press of the same paw. */
export function createPawPrintMasks(options: {
  createCanvas: CreateCanvas;
}): AnyCanvas[] {
  const { x0, y0, texelsPerUnit } = PAW_PRINT_BOX;
  const width = PAW_PRINT_BOX.width * texelsPerUnit;
  const height = PAW_PRINT_BOX.height * texelsPerUnit;
  return Array.from({ length: PAW_PRINT_BOX.variants }, (_, variant) => {
    const canvas = options.createCanvas({ width, height });
    const g = getContext2d(canvas);
    const image = g.createImageData(width, height);
    const offset = variant * 37.3;
    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        const x = x0 + px / texelsPerUnit;
        const y = y0 + py / texelsPerUnit;
        const wobbleX = (valueNoise(x * 0.6 + offset, y * 0.6) - 0.5) * 0.6;
        const wobbleY = (valueNoise(x * 0.6, y * 0.6 + offset) - 0.5) * 0.6;
        const d =
          pawDistance(x + wobbleX, y + wobbleY) +
          (valueNoise(x * 2 + offset, y * 2 + 3) - 0.5) * 0.4;
        const inked = 1 - smoothstep(-0.3, 0.2, d);
        const ink = (() => {
          if (inked > 0) {
            const patchy =
              inked * (0.78 + 0.22 * valueNoise(x * 0.8 + offset + 5, y * 0.8));
            return valueNoise(x * 1.7 + offset, y * 1.7 + 1) > 0.8
              ? patchy * 0.55
              : patchy;
          }
          return d < 0.9 && valueNoise(x * 3 + offset + 8, y * 3) > 0.84
            ? 0.6
            : 0;
        })();
        image.data[(py * width + px) * 4 + 3] = Math.round(ink * 235);
      }
    }
    g.putImageData(image, 0, 0);
    return canvas;
  });
}
