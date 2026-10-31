const WORLD_WIDTH = 1600;
const MAX_PAN = 0.8;

/** Return the stereo pan for world `x`, mapping 0..1600 onto -0.8..0.8 and clamping outside it. */
export function getPanFromWorldX(x: number) {
  const share = Math.min(Math.max(x / WORLD_WIDTH, 0), 1);
  return (share * 2 - 1) * MAX_PAN;
}
