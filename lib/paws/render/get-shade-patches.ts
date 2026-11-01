import { createSeededRandom } from "@/lib/paws/sim/create-seeded-random";
import { smoothstep } from "@/lib/paws/sim/smoothstep";
import type { Sky } from "@/lib/paws/sky/sky-types";

const PATCH_COUNT = 5;
const TAU = Math.PI * 2;

export type ShadePatch = {
  x: number;
  y: number;
  rx: number;
  ry: number;
  angle: number;
  /** 0–1 share of the season's shade ink this patch is printed with. */
  strength: number;
};

/** Return the canopy shade patches over a `width` by `height` paper at `time` seconds for `sky`, the same for the same `seed`: each wanders on two slow waves and breathes in size, no faster than a few pixels a second so the paper's few repaints a second stay smooth, fades out on its own six-to-ten-minute cycle and fades back in somewhere new, shifts away from a low sun and turns and stretches along its light, and thins at night. */
export function getShadePatches(options: {
  seed: number;
  time: number;
  sky: Sky;
  width: number;
  height: number;
}): ShadePatch[] {
  const { time, sky, width, height } = options;
  const random = createSeededRandom({ seed: Math.floor(options.seed * 1e9) });
  const up = Math.min(1, Math.max(0, sky.sunElevation / 60));
  const low = 1 - up;
  const toSun = smoothstep(0.2, 0.8, low);
  const castX = -sky.sunSide * width * 0.12 * low;
  const castY = height * 0.06 * low;
  const daylight = 0.4 + 0.6 * smoothstep(-6, 10, sky.sunElevation);
  return Array.from({ length: PATCH_COUNT }, (_, i) => {
    const wander = [240 + random() * 180, 520 + random() * 280];
    const breathe = 120 + random() * 80;
    const life = 360 + random() * 240;
    const phase = random() * TAU;
    const lived = time / life + i / PATCH_COUNT;
    const round = Math.floor(lived);
    const place = createSeededRandom({
      seed: Math.floor(options.seed * 1e9) + (i + 1) * 7919 + round * 104_729,
    });
    const baseX = place() * width;
    const baseY = place() * height * 0.7;
    const baseRx = width * (0.16 + place() * 0.12);
    const baseRy = height * (0.16 + place() * 0.1);
    const baseAngle = place() * Math.PI;
    const at = (period: number, offset = 0) =>
      Math.sin((time / period) * TAU + phase + offset);
    const presence = Math.sin(Math.PI * (lived - round)) ** 2;
    const stretch = 1 + 0.45 * low;
    return {
      x:
        baseX +
        width * (0.07 * at(wander[0]) + 0.04 * at(wander[1], 1.3)) +
        castX,
      y:
        baseY +
        height * (0.06 * at(wander[0], 2.1) + 0.04 * at(wander[1], 0.4)) +
        castY,
      rx: baseRx * (1 + 0.15 * at(breathe)) * stretch,
      ry: baseRy * (1 + 0.15 * at(breathe, 1.9)),
      angle: (baseAngle + 0.25 * at(wander[1], 2.7)) * (1 - toSun),
      strength: presence * daylight,
    };
  });
}
