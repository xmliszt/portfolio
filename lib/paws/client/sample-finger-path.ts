export type FingerSample = {
  x: number;
  y: number;
  t: number;
  pressed: boolean;
};

function catmullRom(options: {
  p0: number;
  p1: number;
  p2: number;
  p3: number;
  u: number;
}) {
  const { p0, p1, p2, p3, u } = options;
  return (
    0.5 *
    (2 * p1 +
      (p2 - p0) * u +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u +
      (3 * p1 - p0 - 3 * p2 + p3) * u * u * u)
  );
}

/** Return where the fingertip in `samples` (sorted by `t`) was at time `t`, on a Catmull-Rom curve through the samples, holding the first or last sample outside their span and the earlier sample across a gap longer than `maxGapMs`, or `undefined` when there are none. */
export function sampleFingerPath(options: {
  samples: FingerSample[];
  t: number;
  maxGapMs?: number;
}) {
  const { samples, t } = options;
  const first = samples.at(0);
  const last = samples.at(-1);
  if (first === undefined || last === undefined) return undefined;
  if (t <= first.t) return { x: first.x, y: first.y, pressed: first.pressed };
  if (t >= last.t) return { x: last.x, y: last.y, pressed: last.pressed };
  const index = samples.findIndex(
    (sample, i) => sample.t <= t && t < samples[i + 1].t
  );
  const p1 = samples[index];
  const p2 = samples[index + 1];
  if (p2.t - p1.t > (options.maxGapMs ?? Infinity))
    return { x: p1.x, y: p1.y, pressed: p1.pressed };
  const p0 = samples[index - 1] ?? p1;
  const p3 = samples[index + 2] ?? p2;
  const u = (t - p1.t) / (p2.t - p1.t);
  return {
    x: catmullRom({ p0: p0.x, p1: p1.x, p2: p2.x, p3: p3.x, u }),
    y: catmullRom({ p0: p0.y, p1: p1.y, p2: p2.y, p3: p3.y, u }),
    pressed: p1.pressed,
  };
}
