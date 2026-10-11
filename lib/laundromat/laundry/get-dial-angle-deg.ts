const START_DEG = -90;
const SWEEP_DEG = 280;

/** Return the rotation, in degrees from pointing right, of a cycle dial set to `detent` out of `detentCount` detents spread evenly clockwise from straight up. */
export function getDialAngleDeg(options: {
  detent: number;
  detentCount: number;
}) {
  const stepDeg = SWEEP_DEG / Math.max(1, options.detentCount - 1);
  return START_DEG + options.detent * stepDeg;
}
