import type { CatLook } from "@/lib/paws/cat-look";
import { getToyFingerId } from "@/lib/paws/sim/get-toy-finger-id";
import { makeCurious } from "@/lib/paws/sim/make-curious";
import { placeToy } from "@/lib/paws/sim/place-toy";
import { placeLegsAtRest } from "@/lib/paws/sim/place-legs-at-rest";
import { releasePaws } from "@/lib/paws/sim/release-paws";
import { setCatState } from "@/lib/paws/sim/set-cat-state";
import { startLeaving } from "@/lib/paws/sim/start-leaving";
import { startZoomies } from "@/lib/paws/sim/start-zoomies";
import type { World } from "@/lib/paws/sim/sim-types";
import { startBoxVisit } from "@/lib/paws/sim/start-box-visit";
import type { ToySnapshot } from "@/lib/paws/wire-types";

import type { Take, TakeFinger } from "./run-take";

export const LOOKS = {
  hero: { coat: "ginger", pattern: "tabby", belly: "white", pads: "pink", size: "medium", fluff: "medium", tail: "large", tailShape: "plume", ears: "medium" },
  ink: { coat: "charcoal", pattern: "tuxedo", belly: "white", pads: "pink", size: "medium", fluff: "small", tail: "medium", tailShape: "slim", ears: "large" },
  cream: { coat: "cream", pattern: "colorpoint", belly: "light", pads: "mauve", size: "small", fluff: "large", tail: "large", tailShape: "plume", ears: "small" },
  calico: { coat: "white", pattern: "calico", belly: "white", pads: "mixed", size: "large", fluff: "medium", tail: "medium", tailShape: "hook", ears: "medium" },
  lilac: { coat: "lilac", pattern: "solid", belly: "coat", pads: "pink", size: "small", fluff: "large", tail: "medium", tailShape: "wave", ears: "medium" },
  choc: { coat: "chocolate", pattern: "tabby", belly: "cream", pads: "black", size: "medium", fluff: "small", tail: "large", tailShape: "slim", ears: "large" },
} as const satisfies { [name: string]: CatLook };

/** Put cat `userId` at `x, y` facing `heading`, then walk it to `goal`. */
export function walk(world: World, userId: string, from: { x: number; y: number; heading: number }, goal: { x: number; y: number }) {
  const cat = world.cats[userId];
  if (cat === undefined) return;
  cat.x = from.x;
  cat.y = from.y;
  cat.heading = from.heading;
  placeLegsAtRest(cat);
  cat.wander = goal;
  cat.rest = undefined;
  setCatState(cat, "approach");
}

/** Walk cat `userId` from where it is to `goal`, letting go of anything its paws are on. */
export const goTo = (userId: string, goal: { x: number; y: number }) => (world: World) => {
  const cat = world.cats[userId];
  if (cat === undefined) return;
  releasePaws(cat);
  cat.pawFingerIds = [];
  cat.wander = goal;
  cat.rest = undefined;
  cat.focusId = undefined;
  setCatState(cat, "approach");
};

/** Send cat `userId` running off the room, away from `from`. */
export const runOff = (userId: string, from: { x: number; y: number }) => (world: World) => {
  const cat = world.cats[userId];
  if (cat) startLeaving({ world, cat, fleeFrom: from });
};

/** Put cat `userId` at `x, y` facing `heading`, already settled into `rest`. */
export function rest(world: World, userId: string, at: { x: number; y: number; heading: number }, pose: "sit" | "sleep") {
  const cat = world.cats[userId];
  if (cat === undefined) return;
  cat.x = at.x;
  cat.y = at.y;
  cat.heading = at.heading;
  cat.weights = { stand: 0, sit: pose === "sit" ? 1 : 0, sleep: pose === "sleep" ? 1 : 0 };
  cat.rest = pose;
  setCatState(cat, pose);
  placeLegsAtRest(cat);
}

export const curious = (userId: string, fingerId: string) => (world: World) => {
  const cat = world.cats[userId];
  if (cat) makeCurious({ world, cat, fingerId });
};

const ease = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));

/** A finger that comes down at `x, y` from `inAt`, presses during each of `presses`, wiggles during `wiggle`, and leaves at `outAt`. */
export function tap(options: { userId: string; x: number; y: number; inAt: number; presses: [number, number][]; outAt: number; wiggle?: { from: number; to: number; radius: number } }): TakeFinger {
  return {
    userId: options.userId,
    at: (t) => {
      if (t < options.inAt || t > options.outAt) return undefined;
      const w = options.wiggle;
      const isWiggling = w !== undefined && t > w.from && t < w.to;
      const amount = isWiggling ? w.radius * ease((t - w.from) / 0.4) * ease((w.to - t) / 0.4) : 0;
      const dx = isWiggling ? Math.sin((t - w.from) * 9) * amount : 0;
      const dy = isWiggling ? Math.cos((t - w.from) * 6.3) * amount * 0.6 : 0;
      const pressed = options.presses.some(([from, to]) => t >= from && t < to);
      return { x: options.x + dx, y: options.y + dy, pressed };
    },
  };
}

/** Keep the cats in `userIds` from noticing fingers or each other until `until`. */
export const calm = (userIds: string[], until: number) => (world: World) => {
  for (const id of userIds) {
    const cat = world.cats[id];
    if (cat === undefined) continue;
    cat.curiousCooldownUntil = until;
    cat.socialCooldownUntil = until;
  }
};

const still = { h: 0, angle: 0, spin: 0 };

/** Toys at fixed spots for a take's room, by kind. */
export const toy = {
  box: (id: string, x: number, y: number, angle = 0): ToySnapshot => ({ ...still, id, x, y, angle, kind: "box" }),
  bowl: (id: string, x: number, y: number): ToySnapshot => ({ ...still, id, x, y, kind: "bowl", spill: undefined }),
  yarn: (id: string, x: number, y: number, left = 1): ToySnapshot => ({ ...still, id, x, y, kind: "yarn", left, fade: 0 }),
  roll: (id: string, x: number, y: number): ToySnapshot => ({ ...still, id, x, y, kind: "roll", isStanding: true, unrolled: 0, fade: 0 }),
};

/** Make cat `userId` curious about the toy `toyId`, so it goes over and paws at it. */
export const playWith = (userId: string, toyId: string) => curious(userId, getToyFingerId(toyId));

/** Send cat `userId` into box `boxId` to stay until a finger presses on the box. */
export const climbIn = (userId: string, boxId: string) => (world: World) => {
  const cat = world.cats[userId];
  if (cat === undefined || !startBoxVisit({ world, cat, boxId })) return;
  if (cat.boxVisit) cat.boxVisit.restSeconds = 999;
};

/** Put cat `userId` inside box `boxId` already, asleep facing `heading` and `back` units toward the wall behind it, to stay until a finger presses on the box. */
export function asleepInBox(world: World, userId: string, boxId: string, heading: number, back = 0) {
  const cat = world.cats[userId];
  const box = world.toys.find((t) => t.id === boxId);
  if (cat === undefined || box === undefined) return;
  rest(world, userId, { x: box.x - Math.cos(heading) * back, y: box.y - Math.sin(heading) * back, heading }, "sleep");
  setCatState(cat, "box");
  cat.boxVisit = { boxId, phase: "in", t: 0, from: { x: box.x, y: box.y }, to: { x: box.x, y: box.y }, restSeconds: 999 };
}

/** Return a watch that makes cat `userId` bat toy `toyId` every time a paw lands on it, at `speed` and toward `angle` when given, where the sim bats only some of the time. */
export const batWhenPawed = (userId: string, toyId: string, options: { speed?: number; angle?: number } = {}) => (world: World) => {
  const speed = options.speed ?? 260;
  const cat = world.cats[userId];
  const target = world.toys.find((t) => t.id === toyId);
  if (cat === undefined || target === undefined) return;
  const fingerId = getToyFingerId(toyId);
  const isLanding = cat.legs.some((leg) => leg.reach?.phase === "planted" && leg.reach.t === 0 && leg.reach.target.kind === "finger" && leg.reach.target.userId === fingerId);
  if (!isLanding) return;
  const direction = options.angle ?? Math.atan2(target.y - cat.y, target.x - cat.x);
  if (target.kind === "bowl") {
    if (target.spill === undefined || target.spill.seconds < 0.05) {
      target.spill = undefined;
      spill(toyId, direction)(world);
      target.vx = 0;
      target.vy = 0;
    }
    return;
  }
  if (target.kind === "roll") {
    target.angle = direction + Math.PI / 2;
    target.isStanding = false;
  }
  if (target.kind === "yarn") target.vh = 180;
  target.vx = Math.cos(direction) * speed;
  target.vy = Math.sin(direction) * speed;
};

/** Spill bowl `bowlId` toward `angle` if it is still full. */
export const spill = (bowlId: string, angle: number) => (world: World) => {
  const bowl = world.toys.find((t) => t.id === bowlId);
  if (bowl?.kind !== "bowl" || bowl.spill !== undefined) return;
  bowl.spill = { x: bowl.x + Math.cos(angle) * 62, y: bowl.y + Math.sin(angle) * 62, seconds: 0 };
};

/** The cat made in the studio. */
export const NEW_LOOK = { coat: "blueGrey", pattern: "tuxedo", belly: "white", pads: "mixed", size: "medium", fluff: "large", tail: "large", tailShape: "plume", ears: "medium" } as const satisfies CatLook;
export const START_LOOK = { coat: "ginger", pattern: "solid", belly: "cream", pads: "pink", size: "medium", fluff: "medium", tail: "medium", tailShape: "slim", ears: "medium" } as const satisfies CatLook;

const FORMAT = new URLSearchParams(globalThis.location?.search ?? "").get("format");
const PORTRAIT = FORMAT === "9:16" || FORMAT === "3:4";
/** Where the new cat stops at the end: the open space beside the end card, which is below it at 9:16. */
const END_SPOT = PORTRAIT ? { x: 640, y: 770 } : { x: 1140, y: 500 };
const END_FLEE_FROM = FORMAT === "3:4" ? { x: 420, y: 790 } : PORTRAIT ? { x: 300, y: 820 } : { x: 860, y: 760 };

export const TAKES: { [name: string]: Take } = {
  room: {
    seed: 11,
    fps: 240,
    seconds: 62,
    residents: [
      { userId: "film-hero", look: LOOKS.hero },
      { userId: "film-ink", look: LOOKS.ink },
      { userId: "film-cream", look: LOOKS.choc },
      { userId: "film-calico", look: LOOKS.calico },
    ],
    visitors: [{ userId: "film-new", look: NEW_LOOK, joinAt: 37.25, leaveAt: 55 }],
    toys: [toy.box("box-1", 430, 250, 0.3), toy.box("box-2", 1380, 800, -0.2), toy.bowl("bowl-1", 900, 790), toy.bowl("bowl-2", 1460, 220), toy.bowl("bowl-3", 230, 860)],
    setup: (world) => {
      walk(world, "film-hero", { x: 140, y: 560, heading: 0.03 }, { x: 980, y: 540 });
      rest(world, "film-ink", { x: 1310, y: 430, heading: 2.9 }, "sit");
      asleepInBox(world, "film-cream", "box-1", 0.3, 40);
      rest(world, "film-calico", { x: 1030, y: 230, heading: 2.2 }, "sit");
      calm(["film-ink", "film-calico"], 17)(world);
      calm(["film-hero"], 14.6)(world);
      calm(["film-cream"], 99)(world);
    },
    watch: batWhenPawed("film-hero", "yarn-1", { speed: 190, angle: -0.1 }),
    fingers: [
      tap({ userId: "film-you-7", x: 760, y: 520, inAt: 3.6, presses: [[4.5, 13.5]], outAt: 14.5 }),
      tap({ userId: "film-sam-3", x: 560, y: 400, inAt: 18.6, presses: [[19.0, 19.5], [20.2, 20.7], [21.4, 24.5]], outAt: 25.2 }),
      tap({ userId: "film-noor-12", x: 1020, y: 640, inAt: 19.6, presses: [[20.0, 20.4]], outAt: 25.6, wiggle: { from: 20.6, to: 24.2, radius: 46 } }),
      tap({ userId: "film-kai-5", x: 1240, y: 330, inAt: 20.6, presses: [[21.1, 21.5], [21.9, 25.4]], outAt: 26 }),
    ],
    directions: [
      { at: 4.6, run: curious("film-hero", "film-you-7") },
      { at: 13, run: (world) => void placeToy({ world, itemId: "yarn-1", x: 640, y: 620 }) },
      { at: 14.6, run: playWith("film-hero", "yarn-1") },
      { at: 20.4, run: goTo("film-hero", { x: 900, y: 600 }) },
      { at: 17, run: (world) => { for (const id of ["film-ink", "film-calico"]) { const cat = world.cats[id]; if (cat) cat.curiousCooldownUntil = 99; } } },
      { at: 20.39, run: (world) => { const cat = world.cats["film-hero"]; if (cat) cat.curiousCooldownUntil = 99; } },
      { at: 33, run: spill("bowl-1", Math.PI - 0.15) },
      { at: 37.26, run: calm(["film-new"], 60) },
      { at: 19.1, run: curious("film-calico", "film-sam-3") },
      { at: 20.5, run: curious("film-hero", "film-noor-12") },
      { at: 21.2, run: curious("film-ink", "film-kai-5") },
      { at: 37.27, run: (world) => walk(world, "film-new", { x: 820, y: 1090, heading: -Math.PI / 2 }, { x: 800, y: 640 }) },
      { at: 45.6, run: calm(["film-new"], 60) },
      { at: 45.6, run: goTo("film-new", END_SPOT) },
      { at: 54.2, run: runOff("film-new", END_FLEE_FROM) },
      { at: 12, run: (world) => { const cat = world.cats["film-ink"]; if (cat) startZoomies({ world, cat }); } },
    ],
  },
};
