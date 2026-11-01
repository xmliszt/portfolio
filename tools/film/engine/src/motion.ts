export type Spring = { omega: number; zeta: number };

export const SPRINGS = {
  snappy: { omega: 28, zeta: 0.8 },
  default: { omega: 18, zeta: 0.9 },
  heavy: { omega: 10, zeta: 1 },
  camera: { omega: 3.2, zeta: 1 },
  slow: { omega: 1.8, zeta: 1 },
  playful: { omega: 16, zeta: 0.45 },
  /** `BubbleFrame`'s pop: stiffness 520, damping 22, mass 0.7. */
  pop: { omega: Math.sqrt(520 / 0.7), zeta: 22 / (2 * Math.sqrt(520 * 0.7)) },
} as const satisfies { [name: string]: Spring };

/** Return the unit step response of `preset` `u` seconds after the step: 0 before, settling at 1. */
export function spring(u: number, preset: Spring) {
  if (u <= 0) return 0;
  const { omega, zeta } = preset;
  if (zeta >= 1) return 1 - Math.exp(-omega * u) * (1 + omega * u);
  const wd = omega * Math.sqrt(1 - zeta * zeta);
  return 1 - Math.exp(-zeta * omega * u) * (Math.cos(wd * u) + ((zeta * omega) / wd) * Math.sin(wd * u));
}

/** Return the value at `t` of something that starts at `from` and springs to each `[at, to]` in turn. */
export function track(t: number, from: number, keys: [number, number][], preset: Spring = SPRINGS.default) {
  return keys.reduce((value, [at, to], i) => value + (to - (i === 0 ? from : keys[i - 1]![1])) * spring(t - at, preset), from);
}

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const ramp = (a: number, b: number, t: number) => clamp01((t - a) / (b - a));
export const mix = (a: number, b: number, u: number) => a + (b - a) * u;

export function mulberry32(seed: number) {
  let s = seed;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let r = Math.imul(s ^ (s >>> 15), 1 | s);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
