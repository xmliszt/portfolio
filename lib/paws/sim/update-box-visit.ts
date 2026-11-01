import { faceToward } from "./face-toward";
import { getBoxEdgeReach } from "./get-box-edge-reach";
import { getBoxGap } from "./get-box-gap";
import { holdStill } from "./hold-still";
import { isToyFingerId } from "./is-toy-finger-id";
import { lerp } from "./lerp";
import { pickRandomSpot } from "./pick-random-spot";
import { setCatState } from "./set-cat-state";
import type { SimCat, Tick } from "./sim-types";
import { smoothstep } from "./smoothstep";
import { walkTo } from "./walk-to";

const HOP_SECONDS = 0.7;
const GIVE_UP_SECONDS = 20;
const LANDING_PUSH = 80;
const POKE_RANGE = 30;
const COOLDOWN_SECONDS = 60;

/** Move `cat` one step through its box visit: walk to the box's edge and face in, hop over the wall, rest inside until its time is up or a player presses on the box, then stand and hop out ahead of it; give up and wander off if the box is gone or out of reach. */
export function updateBoxVisit(options: { tick: Tick; cat: SimCat }) {
  const { tick, cat } = options;
  const { world, dtSeconds } = tick;
  const visit = cat.boxVisit;
  const box = world.toys.find((toy) => toy.id === visit?.boxId);
  const k = cat.build.scale;
  const wanderOff = () => {
    cat.rest = undefined;
    cat.boxCooldownUntil = world.time + COOLDOWN_SECONDS * (1 + world.random());
    cat.wander = pickRandomSpot({ world, cat });
    setCatState(cat, "approach");
  };
  if (visit === undefined || box === undefined) {
    wanderOff();
    return;
  }
  visit.t += dtSeconds;
  switch (visit.phase) {
    case "go": {
      if (visit.t > GIVE_UP_SECONDS) {
        wanderOff();
        return;
      }
      if (walkTo({ tick, cat, goal: visit.from, pace: 0.8 }) > 14 * k) return;
      if (faceToward({ tick, cat, point: box }) > 0.2) return;
      visit.phase = "hop";
      visit.t = 0;
      visit.from = { x: cat.x, y: cat.y };
      visit.to = { x: box.x, y: box.y };
      return;
    }
    case "hop":
    case "out": {
      holdStill({ tick, cat });
      cat.speed = 0;
      const p = smoothstep(0, HOP_SECONDS, visit.t);
      cat.x = lerp(visit.from.x, visit.to.x, p);
      cat.y = lerp(visit.from.y, visit.to.y, p);
      if (visit.t < HOP_SECONDS) return;
      if (visit.phase === "out") {
        wanderOff();
        return;
      }
      box.vx += Math.cos(cat.heading) * LANDING_PUSH;
      box.vy += Math.sin(cat.heading) * LANDING_PUSH;
      cat.rest = world.random() < 0.6 ? "sleep" : "sit";
      visit.phase = "in";
      visit.t = 0;
      return;
    }
    case "in": {
      holdStill({ tick, cat });
      const isPoked = Object.values(world.fingers).some(
        (finger) =>
          finger.present &&
          finger.pressed &&
          !isToyFingerId(finger.userId) &&
          getBoxGap({ box, x: finger.x, y: finger.y }) < POKE_RANGE
      );
      if (isPoked || visit.t > visit.restSeconds) cat.rest = undefined;
      if (cat.rest !== undefined || cat.weights.stand < 0.7) return;
      visit.phase = "out";
      visit.t = 0;
      visit.from = { x: cat.x, y: cat.y };
      visit.to = {
        x: cat.x + Math.cos(cat.heading) * getBoxEdgeReach(k),
        y: cat.y + Math.sin(cat.heading) * getBoxEdgeReach(k),
      };
      return;
    }
    default: {
      const unknown: never = visit.phase;
      return unknown;
    }
  }
}
