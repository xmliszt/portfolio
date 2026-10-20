export const CHARM_KINDS = [
  "heart",
  "clover",
  "sun",
  "smiley",
  "star",
] as const;

export type CharmKind = (typeof CHARM_KINDS)[number];

export type CharmFlight = {
  kind: CharmKind;
  dxPx: number;
  risePx: number;
  fallPx: number;
  spinDeg: number;
  durationMs: number;
  delayMs: number;
};

const BURST = {
  full: { min: 2, max: 4 },
  lite: { min: 1, max: 2 },
};
const MAX_DX_PX = 30;
const RISE_PX = { min: 16, max: 34 };
const FALL_PX = { min: 4, max: 16 };
const MAX_SPIN_DEG = 220;
const DURATION_MS = { min: 1500, max: 2100 };
const STAGGER_MS = 90;

function between(options: { random: () => number; min: number; max: number }) {
  return options.min + options.random() * (options.max - options.min);
}

/** Return one burst of charms for `tier`, each a random kind flying out on its own arc: sideways by `dxPx` (spread evenly across the burst so they fan out), up by `risePx`, then down `fallPx` below where it started, spinning `spinDeg`, starting `delayMs` after the one before. */
export function planCharmBurst(options: {
  tier: "full" | "lite";
  random: () => number;
}): CharmFlight[] {
  const { random } = options;
  const size = Math.round(
    between({
      random,
      min: BURST[options.tier].min,
      max: BURST[options.tier].max,
    })
  );
  return Array.from({ length: size }, (_, index) => {
    const lane = size === 1 ? 0 : (index / (size - 1)) * 2 - 1;
    const jitter = (random() * 2 - 1) * 0.35;
    return {
      kind: CHARM_KINDS[Math.floor(random() * CHARM_KINDS.length)],
      dxPx: Math.max(-1, Math.min(1, lane * 0.8 + jitter)) * MAX_DX_PX,
      risePx: between({ random, ...RISE_PX }),
      fallPx: between({ random, ...FALL_PX }),
      spinDeg: (random() * 2 - 1) * MAX_SPIN_DEG,
      durationMs: between({ random, ...DURATION_MS }),
      delayMs: index * STAGGER_MS,
    };
  });
}
