/** Return `angle` in radians wrapped into the range −π to π. */
export function wrapAngle(angle: number) {
  return Math.atan2(Math.sin(angle), Math.cos(angle));
}
