import type { SimCat, SimFinger } from "./sim-types";

const REACH = 220;
const MAX_SPAN = 260;

/** Return the two nearest pressed fingers of different players that `cat` can put a front paw on at once, or `undefined` when there are not two. */
export function findSharedFingers(options: {
  cat: SimCat;
  fingers: SimFinger[];
}): [SimFinger, SimFinger] | undefined {
  const { cat } = options;
  const gapTo = (finger: SimFinger) =>
    Math.hypot(finger.x - cat.x, finger.y - cat.y);
  const [first, second] = options.fingers
    .filter(
      (finger) => finger.present && finger.pressed && gapTo(finger) < REACH
    )
    .toSorted((a, b) => gapTo(a) - gapTo(b));
  if (
    first === undefined ||
    second === undefined ||
    first.userId === second.userId
  )
    return undefined;
  if (
    Math.hypot(first.x - second.x, first.y - second.y) >
    MAX_SPAN * cat.build.scale
  )
    return undefined;
  return [first, second];
}
