import { blendPose } from "./blend-pose";
import { pickRandomSpot } from "./pick-random-spot";
import { placeLegsAtRest } from "./place-legs-at-rest";
import { setCatState } from "./set-cat-state";
import type { SimCat, World } from "./sim-types";

/** Put `cat` just past a random edge of the glass, facing a free spot it then walks in to. */
export function spawnCat(options: { world: World; cat: SimCat }) {
  const { world, cat } = options;
  const margin = 200 * cat.build.scale;
  const side = Math.floor(world.random() * 4);
  const along = 0.15 + world.random() * 0.7;
  const start = [
    { x: -margin, y: world.height * along },
    { x: world.width + margin, y: world.height * along },
    { x: world.width * along, y: -margin },
    { x: world.width * along, y: world.height + margin },
  ][side];
  cat.x = start.x;
  cat.y = start.y;
  cat.wander = pickRandomSpot({ world, cat });
  cat.heading = Math.atan2(cat.wander.y - cat.y, cat.wander.x - cat.x);
  Object.assign(cat, {
    speed: 0,
    angVel: 0,
    bend: 0,
    yaw: 0,
    sniff: 0,
    rest: undefined,
    repositionDir: undefined,
    focusId: undefined,
    pawFingerIds: [],
    social: undefined,
    partnerId: undefined,
    isSnuggling: false,
    socialCooldownUntil: world.time + 4 + world.random() * 8,
    weights: { stand: 1, sit: 0, sleep: 0 },
  } satisfies Partial<SimCat>);
  cat.pose = blendPose(cat.weights);
  setCatState(cat, "enter");
  placeLegsAtRest(cat);
}
