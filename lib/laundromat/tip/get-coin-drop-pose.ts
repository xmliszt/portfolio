const FALL_MS = 240;
const RESTITUTION = 0.42;
const BOUNCES = 3;
const TIP_MS = 300;
const WOBBLE = { ms: 520, amplitudeDeg: 16, startHz: 4, endHz: 11 };

export type CoinDropPose = { heightPx: number; tiltDeg: number };

function getBounceTimes(options: { dropPx: number }) {
  const gravity = (2 * options.dropPx) / (FALL_MS / 1000) ** 2;
  const impactSpeed = gravity * (FALL_MS / 1000);
  return Array.from({ length: BOUNCES }, (_, index) => {
    const speed = impactSpeed * RESTITUTION ** (index + 1);
    return { speed, durationMs: ((2 * speed) / gravity) * 1000 };
  }).reduce<{ startMs: number; speed: number; durationMs: number }[]>(
    (bounces, bounce) => {
      const last = bounces.at(-1);
      const startMs =
        last === undefined ? FALL_MS : last.startMs + last.durationMs;
      return [...bounces, { ...bounce, startMs }];
    },
    []
  );
}

function easeInOut(progress: number) {
  return progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
}

/** Return the total time in ms a coin dropped from `dropPx` above the tray takes to fall, bounce, tip flat and stop wobbling. */
export function getCoinDropMs(options: { dropPx: number }) {
  const last = getBounceTimes(options).at(-1);
  const settledMs =
    last === undefined ? FALL_MS : last.startMs + last.durationMs;
  return Math.max(settledMs, FALL_MS + TIP_MS) + WOBBLE.ms;
}

/** Return how high above the tray a coin dropped from `dropPx` is `atMs` after it left the chute, and how far it has tipped from standing on its edge (0°) to lying flat (90°): it falls under gravity, bounces `BOUNCES` times losing speed by `RESTITUTION`, tips over from the first impact, then wobbles flat with a shrinking, quickening rock. */
export function getCoinDropPose(options: {
  dropPx: number;
  atMs: number;
}): CoinDropPose {
  const { dropPx, atMs } = options;
  const gravity = (2 * dropPx) / (FALL_MS / 1000) ** 2;
  const heightPx = (() => {
    if (atMs <= 0) return dropPx;
    if (atMs < FALL_MS) {
      return dropPx - (gravity * (atMs / 1000) ** 2) / 2;
    }
    const bounce = getBounceTimes({ dropPx }).find(
      ({ startMs, durationMs }) =>
        atMs >= startMs && atMs < startMs + durationMs
    );
    if (bounce === undefined) return 0;
    const seconds = (atMs - bounce.startMs) / 1000;
    return Math.max(0, bounce.speed * seconds - (gravity * seconds ** 2) / 2);
  })();
  const tipMs = atMs - FALL_MS;
  const wobbleMs = tipMs - TIP_MS;
  const tiltDeg = (() => {
    if (tipMs <= 0) return 0;
    if (wobbleMs <= 0) return 90 * easeInOut(tipMs / TIP_MS);
    if (wobbleMs >= WOBBLE.ms) return 90;
    const progress = wobbleMs / WOBBLE.ms;
    const hz = WOBBLE.startHz + (WOBBLE.endHz - WOBBLE.startHz) * progress;
    const phase = 2 * Math.PI * hz * (wobbleMs / 1000);
    return (
      90 - WOBBLE.amplitudeDeg * (1 - progress) ** 2 * Math.abs(Math.sin(phase))
    );
  })();
  return { heightPx, tiltDeg };
}
