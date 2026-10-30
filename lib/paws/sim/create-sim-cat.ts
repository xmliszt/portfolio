import type { CatLook } from "@/lib/paws/cat-look";
import type { CatSnapshot } from "@/lib/paws/wire-types";

import { blendPose } from "./blend-pose";
import { deriveCat } from "./derive-cat";
import { getCatBuild } from "./get-cat-build";
import { LEG_LAYOUT } from "./leg-layout";
import type { SimCat, SimLeg, World } from "./sim-types";

const toLeg = (index: 0 | 1 | 2 | 3, snapshot: CatSnapshot): SimLeg => ({
  ...LEG_LAYOUT[index],
  x: snapshot.legs[index].x,
  y: snapshot.legs[index].y,
  h: snapshot.legs[index].h,
  idealX: snapshot.legs[index].x,
  idealY: snapshot.legs[index].y,
  gap: 0,
  swing: undefined,
  reach: undefined,
});

/** Return a new cat for player `userId` standing still where `snapshot` puts it; callers then spawn it or restore its activity. */
export function createSimCat(options: {
  world: World;
  userId: string;
  look: CatLook;
  snapshot?: CatSnapshot;
}) {
  const { world, userId, look } = options;
  const snapshot: CatSnapshot = options.snapshot ?? {
    userId,
    x: -1000,
    y: -1000,
    heading: 0,
    speed: 0,
    bend: 0,
    pose: { stand: 1, sit: 0, sleep: 0 },
    yaw: 0,
    sniff: 0,
    legs: [
      { x: -1000, y: -1000, h: 0 },
      { x: -1000, y: -1000, h: 0 },
      { x: -1000, y: -1000, h: 0 },
      { x: -1000, y: -1000, h: 0 },
    ],
    activity: "enter",
  };
  const weights = { ...snapshot.pose };
  const cat: SimCat = {
    userId,
    look,
    build: getCatBuild(look),
    x: snapshot.x,
    y: snapshot.y,
    heading: snapshot.heading,
    speed: snapshot.speed,
    speedTarget: 0,
    angVel: 0,
    bend: snapshot.bend,
    state: "pause",
    stateT: 0,
    waitSeconds: 0,
    pauseSeconds: 2,
    rest: undefined,
    weights,
    pose: blendPose(weights),
    yaw: snapshot.yaw,
    sniff: snapshot.sniff,
    legs: [
      toLeg(0, snapshot),
      toLeg(1, snapshot),
      toLeg(2, snapshot),
      toLeg(3, snapshot),
    ],
    derived: deriveCat({ snapshot, look, time: world.time }),
    repositionDir: undefined,
    sniffCooldownSeconds: 0,
    hasNosed: false,
    previousHeadGap: 0,
    approachSpeed: 0,
    curiosity: 0.3 + world.random() * 0.7,
    playful: world.random(),
    focusId: undefined,
    curiousUntil: 0,
    curiousCooldownUntil: 0,
    pawFingerIds: [],
    social: undefined,
    partnerId: undefined,
    isSnuggling: false,
    socialCooldownUntil: world.time + 4 + world.random() * 8,
    quietUntil: 0,
    wander: { x: snapshot.x, y: snapshot.y },
    exit: { x: snapshot.x, y: snapshot.y },
    isDeparting: false,
  };
  return cat;
}
