import type { TipCoinMetal } from "./tip-coin-metals";

export const MAX_PILE_COINS = 84;
export const MAX_PILE_RADIUS = 0.8;
const COINS_PER_LAYER = 7;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const PILE_METALS: Exclude<TipCoinMetal, "bimetal">[] = [
  "copper",
  "silver",
  "brass",
];

function random(seed: number) {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export type PileCoin = {
  u: number;
  v: number;
  layer: number;
  tiltDeg: number;
  metal: Exclude<TipCoinMetal, "bimetal">;
};

/** Return where each of up to `MAX_PILE_COINS` of `count` coins lies in a jar: its offset `u` and `v` as fractions of the jar's inner radius, its `layer` from the bottom, a tilt and a metal, the same for the same index every time, bottom layer first. */
export function getJarCoinPile(count: number): PileCoin[] {
  return Array.from(
    { length: Math.min(Math.max(0, Math.floor(count)), MAX_PILE_COINS) },
    (_, index) => {
      const slot = index % COINS_PER_LAYER;
      const angle = index * GOLDEN_ANGLE + random(index) * 0.6;
      const distance =
        Math.sqrt((slot + 0.5) / COINS_PER_LAYER) * MAX_PILE_RADIUS;
      return {
        u: Math.cos(angle) * distance,
        v: Math.sin(angle) * distance,
        layer: Math.floor(index / COINS_PER_LAYER),
        tiltDeg: (random(index + 101) - 0.5) * 50,
        metal:
          PILE_METALS[Math.floor(random(index + 303) * PILE_METALS.length)],
      };
    }
  );
}
