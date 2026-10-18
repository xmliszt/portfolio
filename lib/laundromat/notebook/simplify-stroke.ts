function getSegmentDistance(options: {
  point: [number, number];
  from: [number, number];
  to: [number, number];
}) {
  const [x, y] = options.point;
  const [x1, y1] = options.from;
  const [x2, y2] = options.to;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared === 0) return Math.hypot(x - x1, y - y1);
  const t = Math.max(
    0,
    Math.min(1, ((x - x1) * dx + (y - y1) * dy) / lengthSquared)
  );
  return Math.hypot(x - (x1 + t * dx), y - (y1 + t * dy));
}

/** Return `points` without the ones that lie within `tolerancePx` of the line through their neighbours (Ramer–Douglas–Peucker), keeping the first and last point. */
export function simplifyStroke(options: {
  points: [number, number][];
  tolerancePx: number;
}): [number, number][] {
  const { points, tolerancePx } = options;
  const from = points.at(0);
  const to = points.at(-1);
  if (points.length < 3 || from === undefined || to === undefined) {
    return points;
  }
  const farthest = points.slice(1, -1).reduce(
    (best, point, index) => {
      const distance = getSegmentDistance({ point, from, to });
      return distance > best.distance ? { index: index + 1, distance } : best;
    },
    { index: 0, distance: 0 }
  );
  if (farthest.distance <= tolerancePx) return [from, to];
  return [
    ...simplifyStroke({
      points: points.slice(0, farthest.index + 1),
      tolerancePx,
    }).slice(0, -1),
    ...simplifyStroke({ points: points.slice(farthest.index), tolerancePx }),
  ];
}
