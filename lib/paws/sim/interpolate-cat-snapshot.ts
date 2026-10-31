import type { CatSnapshot, LegSnapshot } from "@/lib/paws/wire-types";

import { lerp } from "./lerp";
import { lerpAngle } from "./lerp-angle";

const lerpLeg = (a: LegSnapshot, b: LegSnapshot, t: number): LegSnapshot => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
  h: lerp(a.h, b.h, t),
});

/** Return the cat a fraction `t` of the way from snapshot `from` to `to`, turning headings the short way round. */
export function interpolateCatSnapshot(options: {
  from: CatSnapshot;
  to: CatSnapshot;
  t: number;
}): CatSnapshot {
  const { from, to, t } = options;
  return {
    userId: to.userId,
    x: lerp(from.x, to.x, t),
    y: lerp(from.y, to.y, t),
    heading: lerpAngle(from.heading, to.heading, t),
    speed: lerp(from.speed, to.speed, t),
    bend: lerp(from.bend, to.bend, t),
    pose: {
      stand: lerp(from.pose.stand, to.pose.stand, t),
      sit: lerp(from.pose.sit, to.pose.sit, t),
      sleep: lerp(from.pose.sleep, to.pose.sleep, t),
    },
    yaw: lerpAngle(from.yaw, to.yaw, t),
    sniff: lerp(from.sniff, to.sniff, t),
    legs: [
      lerpLeg(from.legs[0], to.legs[0], t),
      lerpLeg(from.legs[1], to.legs[1], t),
      lerpLeg(from.legs[2], to.legs[2], t),
      lerpLeg(from.legs[3], to.legs[3], t),
    ],
    activity: t < 0.5 ? from.activity : to.activity,
  };
}
