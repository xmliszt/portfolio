import { TOY_SET } from "./toy-set-geometry";

const SAMPLES = 240;

function pointAt(angle: number) {
  const { ramp, base } = TOY_SET;
  return {
    y: ramp.footY - ramp.reach * Math.sin(angle),
    z: base.height + (ramp.rise / 2) * (1 - Math.cos(angle)),
  };
}

const lengths = Array.from({ length: SAMPLES }, (_, index) => {
  const from = pointAt((Math.PI * index) / SAMPLES);
  const to = pointAt((Math.PI * (index + 1)) / SAMPLES);
  return Math.hypot(to.y - from.y, to.z - from.z);
}).reduce<number[]>(
  (cumulative, length) => [...cumulative, (cumulative.at(-1) ?? 0) + length],
  [0]
);

/** The ramp curve's arc length, and the arc length from the foot to each of `samples + 1` evenly spaced ellipse angles from the foot (0) to the top (π). */
export const TOY_RAMP_CURVE = {
  length: lengths.at(-1) ?? 0,
  cumulativeLengths: lengths,
  samples: SAMPLES,
} as const;
