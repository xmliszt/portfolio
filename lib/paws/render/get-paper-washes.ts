import type { Sky } from "@/lib/paws/sky/sky-types";

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

/** Return the three ink washes for a `width` by `height` paper at `time` seconds, each drifting slowly around its place: inked from `sky` with the glow on the sun's side when it is given, otherwise from the palette `seed` picks in `PAPER_PALETTES`, blending into the next one every `PALETTE_SECONDS`. */
export function getPaperWashes(options: {
  seed: number;
  time: number;
  width: number;
  height: number;
  sky?: Sky;
}) {
  const { seed, time, width, height, sky } = options;
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
  if (sky !== undefined) {
    const { light } = sky;
    const up = Math.min(1, Math.max(0, sky.sunElevation / 50));
    const isNight = sky.sunElevation < -6;
    return [
      {
        ink: light.edge,
        x: width * (0.5 + 0.08 * drift(0)),
        y: height * (0.45 + 0.08 * drift(1.7)),
        r0: Math.min(width, height) * 0.15,
        r1: longest * 0.8,
        a0: 0,
        a1: light.edgeAlpha,
      },
      {
        ink: light.glow,
        x: isNight
          ? width * 0.22
          : width * (0.5 + 0.42 * sky.sunSide * (1 - 0.5 * up)) +
            width * 0.03 * drift(2.9),
        y: isNight
          ? height * 0.12
          : height * (0.5 - 0.42 * up) + height * 0.03 * drift(4.1),
        r0: 0,
        r1: longest * 0.55,
        a0: light.glowAlpha,
        a1: 0,
      },
      {
        ink: light.corner,
        x: width * (0.05 + 0.08 * drift(5.3)),
        y: height * (0.98 - 0.08 * drift(0.6)),
        r0: 0,
        r1: longest * 0.45,
        a0: light.cornerAlpha,
        a1: 0,
      },
    ] satisfies PaperWash[];
  }
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
