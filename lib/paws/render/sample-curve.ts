import type { Vec4 } from "@/lib/paws/sim/cat-poses";

/** Return points sampled along a Catmull-Rom curve through `points` (each `[x, y, r, h]`), `perSegment` samples per segment. */
export function sampleCurve(options: {
  points: Vec4[];
  perSegment: number;
}): Vec4[] {
  const { points, perSegment } = options;
  const last = points.length - 1;
  const samples = points.slice(0, -1).flatMap((p1, i) => {
    const p0 = points[Math.max(0, i - 1)];
    const p2 = points[i + 1];
    const p3 = points[Math.min(last, i + 2)];
    const at = (d: 0 | 1 | 2 | 3, t: number) => {
      const t2 = t * t;
      return (
        0.5 *
        (2 * p1[d] +
          (-p0[d] + p2[d]) * t +
          (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * t2 +
          (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * t2 * t)
      );
    };
    return Array.from({ length: perSegment }, (_, j): Vec4 => {
      const t = j / perSegment;
      return [at(0, t), at(1, t), at(2, t), at(3, t)];
    });
  });
  const end = points[last];
  return [...samples, [end[0], end[1], end[2], end[3]]];
}
