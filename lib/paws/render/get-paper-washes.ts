import { mixHex } from "./mix-hex";
import { PAPER_PALETTES } from "./paper-palettes";

const PALETTE_SECONDS = 150;
const BLEND_SECONDS = 30;
const DRIFT_SECONDS = 97;

export type PaperWash = {
  ink: string;
  x: number;
  y: number;
  r0: number;
  r1: number;
  a0: number;
  a1: number;
};

function smoothstep(value: number) {
  const t = Math.min(1, Math.max(0, value));
  return t * t * (3 - 2 * t);
}

/** Return the three ink washes for a `width` by `height` paper at `time` seconds: the palette `seed` picks from `PAPER_PALETTES` blends into the next one every `PALETTE_SECONDS`, and each wash drifts slowly around its place. */
export function getPaperWashes(options: {
  seed: number;
  time: number;
  width: number;
  height: number;
}) {
  const { seed, time, width, height } = options;
  const count = PAPER_PALETTES.length;
  const start = Math.floor(seed * count);
  const turn = Math.floor(time / PALETTE_SECONDS);
  const blend = smoothstep(
    (time - turn * PALETTE_SECONDS - (PALETTE_SECONDS - BLEND_SECONDS)) /
      BLEND_SECONDS
  );
  const paletteAt = (offset: number) =>
    PAPER_PALETTES[(((start + turn + offset) % count) + count) % count];
  const from = paletteAt(0);
  const to = paletteAt(1);
  const ink = (key: keyof (typeof PAPER_PALETTES)[number]) =>
    mixHex({ from: from[key], to: to[key], amount: blend });
  const phase = seed * Math.PI * 2;
  const drift = (offset: number) =>
    Math.sin((time / DRIFT_SECONDS) * Math.PI * 2 + phase + offset);
  const longest = Math.max(width, height);
  return [
    {
      ink: ink("edge"),
      x: width * (0.5 + 0.08 * drift(0)),
      y: height * (0.45 + 0.08 * drift(1.7)),
      r0: Math.min(width, height) * 0.15,
      r1: longest * 0.8,
      a0: 0,
      a1: 0.26,
    },
    {
      ink: ink("glow"),
      x: width * (0.84 - 0.1 * drift(2.9)),
      y: height * (0.08 + 0.08 * drift(4.1)),
      r0: 0,
      r1: longest * 0.5,
      a0: 0.38,
      a1: 0,
    },
    {
      ink: ink("corner"),
      x: width * (0.05 + 0.08 * drift(5.3)),
      y: height * (0.98 - 0.08 * drift(0.6)),
      r0: 0,
      r1: longest * 0.45,
      a0: 0.14,
      a1: 0,
    },
  ] satisfies PaperWash[];
}
