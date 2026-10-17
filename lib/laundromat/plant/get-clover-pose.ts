import type { FallingClover } from "./create-falling-clovers";

const MIN_FLIP = 0.12;

/** Return `clover`'s pose at `timeS`, or `undefined` outside `delayS` to `delayS + fallS`; with `still`, keep it at `stillY` and fade it in and out. */
export function getCloverPose(options: {
  clover: FallingClover;
  timeS: number;
  viewportHeight: number;
  gustPx: number;
  still: boolean;
}) {
  const { clover } = options;
  const ownS = options.timeS - clover.delayS;
  const progress = ownS / clover.fallS;
  if (progress < 0 || progress > 1) return undefined;
  const opacity = 0.7 + 0.3 * clover.depth;
  if (options.still) {
    return {
      x: clover.x,
      y: clover.stillY,
      rotation: clover.rotation,
      flip: 1,
      opacity: opacity * Math.sin(Math.PI * progress),
    };
  }
  const swayAngle = Math.PI * 2 * clover.swayHz * ownS + clover.swayPhase;
  const flip = Math.cos(Math.PI * 2 * clover.flipHz * ownS + clover.flipPhase);
  const fallen = progress * 0.85 + progress ** 2 * 0.15;
  return {
    x:
      clover.x +
      clover.swayPx * Math.sin(swayAngle) +
      clover.driftPxPerS * ownS +
      options.gustPx * (0.4 + 0.6 * clover.depth),
    y: -clover.sizePx + (options.viewportHeight + 2 * clover.sizePx) * fallen,
    rotation: clover.rotation + clover.spin * ownS + 0.35 * Math.sin(swayAngle),
    flip: Math.sign(flip || 1) * Math.max(MIN_FLIP, Math.abs(flip)),
    opacity,
  };
}
