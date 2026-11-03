import type { Vec4 } from "@/lib/paws/sim/cat-poses";
import { valueNoise } from "@/lib/paws/sim/value-noise";

/** Return a copy of `samples` with each radius and each sideways position varied smoothly by up to `amount` of the radius, `bumps` times along the run, in a pattern fixed by `seed`. */
export function wobbleSamples(options: {
  samples: Vec4[];
  seed: number;
  amount: number;
  bumps: number;
}) {
  const { samples, seed, amount, bumps } = options;
  const last = samples.length - 1;
  return samples.map(([x, y, r, h], i): Vec4 => {
    const before = samples[Math.max(0, i - 1)];
    const after = samples[Math.min(last, i + 1)];
    const tx = after[0] - before[0];
    const ty = after[1] - before[1];
    const length = Math.hypot(tx, ty) || 1;
    const t = last === 0 ? 0 : (i / last) * bumps;
    const grow = valueNoise(t, seed) - 0.5;
    const shift = (valueNoise(t + 17.3, seed) - 0.5) * 1.2 * amount * r;
    return [
      x - (ty / length) * shift,
      y + (tx / length) * shift,
      r * (1 + 2 * amount * grow),
      h,
    ];
  });
}
