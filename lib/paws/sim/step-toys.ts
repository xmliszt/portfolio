import { bumpToys } from "./bump-toys";
import { clamp } from "./clamp";
import { getToyFingerId } from "./get-toy-finger-id";
import { getToyRadius } from "./get-toy-radius";
import { isCatOnstage } from "./is-cat-onstage";
import { separateToys } from "./separate-toys";
import type { SimCat, SimToy, Tick, World } from "./sim-types";
import { TOY_LIMITS } from "./toy-limits";

const GRAVITY = 1400;
const BAT_CHANCE = 0.6;
const BOUNCE_SPEED = 120;
const EDGE_GAP = 30;
const THREAD_STEP = 12;
const STRIP_STEP = 14;
const ON_GLASS = 6;

function layTrail(options: { world: World; toy: SimToy; step: number }) {
  const { world, toy, step } = options;
  const trail = world.trails[toy.id] ?? [];
  const last = trail.at(-1);
  if (last !== undefined && Math.hypot(last[0] - toy.x, last[1] - toy.y) < step)
    return;
  world.trails[toy.id] = [...trail, [Math.round(toy.x), Math.round(toy.y)]];
}

function bat(options: { toy: SimToy; cat: SimCat; random: () => number }) {
  const { toy, cat, random } = options;
  const direction =
    Math.atan2(toy.y - cat.y, toy.x - cat.x) + (random() - 0.5) * 0.8;
  const push = (speed: number) => {
    toy.vx = Math.cos(direction) * speed;
    toy.vy = Math.sin(direction) * speed;
  };
  switch (toy.kind) {
    case "yarn":
      push(150 + random() * 130);
      toy.vh = 140 + random() * 80;
      return;
    case "roll":
      toy.angle = direction + Math.PI / 2;
      push(toy.isStanding ? 110 : 140 + random() * 100);
      toy.isStanding = false;
      return;
    case "box":
      return;
    case "bowl":
      if (toy.spill === undefined) {
        toy.spill = {
          x: toy.x + Math.cos(direction) * TOY_LIMITS.puddleRadius,
          y: toy.y + Math.sin(direction) * TOY_LIMITS.puddleRadius,
          seconds: 0,
        };
      }
      push(50);
      return;
    default: {
      const unknown: never = toy;
      return unknown;
    }
  }
}

/** Move every toy in the room one step: cats walking into toys push them, overlapping toys push apart, a cat's paw landing on a toy bats it now and then, toys slide, hop and bounce off the edges, a knocked roll unrolls its paper as it rolls and a yarn ball pays out its thread as it moves, each laying its trail in `world.trails`, a used-up ball or roll fades with its trail and then leaves the room, and spilled water dries until the bowl is full again. */
export function stepToys(tick: Tick) {
  const { world, dtSeconds } = tick;
  const cats = Object.values(world.cats);
  bumpToys({ toys: world.toys, cats: cats.filter(isCatOnstage) });
  separateToys(world.toys);
  for (const toy of world.toys) {
    const fingerId = getToyFingerId(toy.id);
    for (const cat of cats) {
      const isLanding = cat.legs.some(
        (leg) =>
          leg.reach?.phase === "planted" &&
          leg.reach.t === 0 &&
          leg.reach.target.kind === "finger" &&
          leg.reach.target.userId === fingerId
      );
      if (isLanding && world.random() < BAT_CHANCE)
        bat({ toy, cat, random: world.random });
    }
    const radius = getToyRadius(toy) + EDGE_GAP;
    toy.x += toy.vx * dtSeconds;
    toy.y += toy.vy * dtSeconds;
    if (toy.x < radius || toy.x > world.width - radius) toy.vx *= -0.6;
    if (toy.y < radius || toy.y > world.height - radius) toy.vy *= -0.6;
    toy.x = clamp(toy.x, radius, world.width - radius);
    toy.y = clamp(toy.y, radius, world.height - radius);
    const slow = Math.exp(-TOY_LIMITS.friction[toy.kind] * dtSeconds);
    toy.vx *= slow;
    toy.vy *= slow;
    if (toy.h > 0 || toy.vh > 0) {
      toy.vh -= GRAVITY * dtSeconds;
      toy.h += toy.vh * dtSeconds;
      if (toy.h <= 0) {
        toy.h = 0;
        toy.vh = toy.vh < -BOUNCE_SPEED ? -toy.vh * 0.35 : 0;
      }
    }
    const speed = Math.hypot(toy.vx, toy.vy);
    switch (toy.kind) {
      case "yarn": {
        if (toy.left <= 0) {
          toy.fade = Math.min(1, toy.fade + dtSeconds / TOY_LIMITS.fadeSeconds);
          break;
        }
        toy.spin += (speed * dtSeconds) / getToyRadius(toy);
        if (toy.h > ON_GLASS) break;
        toy.left = Math.max(
          0,
          toy.left - (speed * dtSeconds) / TOY_LIMITS.threadLength
        );
        layTrail({ world, toy, step: THREAD_STEP });
        break;
      }
      case "roll":
        if (toy.isStanding) break;
        if (toy.unrolled >= TOY_LIMITS.maxUnrolled) {
          toy.fade = Math.min(1, toy.fade + dtSeconds / TOY_LIMITS.fadeSeconds);
          break;
        }
        toy.spin += (speed * dtSeconds) / TOY_LIMITS.radius.roll;
        toy.unrolled = Math.min(
          TOY_LIMITS.maxUnrolled,
          toy.unrolled + speed * dtSeconds
        );
        layTrail({ world, toy, step: STRIP_STEP });
        break;
      case "box":
        break;
      case "bowl":
        if (toy.spill === undefined) break;
        toy.spill.seconds += dtSeconds;
        if (toy.spill.seconds > TOY_LIMITS.spillSeconds) toy.spill = undefined;
        break;
      default: {
        const unknown: never = toy;
        return unknown;
      }
    }
  }
  const faded = world.toys.filter(isFadedAway);
  if (faded.length === 0) return;
  world.toys = world.toys.filter((toy) => !isFadedAway(toy));
  for (const toy of faded) delete world.trails[toy.id];
}

function isFadedAway(toy: SimToy) {
  return (toy.kind === "yarn" || toy.kind === "roll") && toy.fade >= 1;
}
