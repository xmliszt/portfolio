import { createSeededRandom } from "@/lib/paws/sim/create-seeded-random";

import { getContext2d } from "./get-context-2d";
import type { CreateCanvas } from "./render-types";

const SIZE = 160;

/** Return a tile of scattered ink specks that, cut out of a layer, gives it a riso print's grain. */
export function createGrainTexture(options: { createCanvas: CreateCanvas }) {
  const canvas = options.createCanvas({ width: SIZE, height: SIZE });
  const g = getContext2d(canvas);
  const image = g.createImageData(SIZE, SIZE);
  const random = createSeededRandom({ seed: 1789 });
  for (let i = 0; i < image.data.length; i += 4) {
    const r = random();
    image.data[i + 3] = r < 0.5 ? 0 : Math.pow((r - 0.5) / 0.5, 1.7) * 200;
  }
  g.putImageData(image, 0, 0);
  return canvas;
}
