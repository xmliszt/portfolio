import { blendPose } from "@/lib/paws/sim/blend-pose";
import { catToWorld } from "@/lib/paws/sim/cat-to-world";
import { getCatBuild } from "@/lib/paws/sim/get-cat-build";
import type { CatActivity, CatSnapshot } from "@/lib/paws/wire-types";

import { buildLook } from "./build-look";

/** Return a snapshot of a still cat at `x, y` facing `heading`, its paws at rest under the given `pose` weights. */
export function buildSnapshot(options: {
  userId: string;
  x: number;
  y: number;
  heading?: number;
  pose?: CatSnapshot["pose"];
  activity?: CatActivity;
}): CatSnapshot {
  const heading = options.heading ?? 0;
  const weights = options.pose ?? { stand: 1, sit: 0, sleep: 0 };
  const pose = blendPose(weights);
  const frame = {
    x: options.x,
    y: options.y,
    heading,
    scale: getCatBuild(buildLook()).scale,
  };
  const leg = (offset: [number, number]) => {
    const [x, y] = catToWorld(frame, offset);
    return { x, y, h: 0 };
  };
  return {
    userId: options.userId,
    x: options.x,
    y: options.y,
    heading,
    speed: 0,
    bend: 0,
    pose: weights,
    yaw: 0,
    sniff: 0,
    legs: [
      leg(pose.front[0]),
      leg(pose.front[1]),
      leg(pose.hind[0]),
      leg(pose.hind[1]),
    ],
    activity: options.activity ?? "pause",
  };
}
