import type { CatLook } from "@/lib/paws/cat-look";
import type { RoomEvent } from "@/lib/paws/wire-types";

import type { Pose, PoseWeights, Vec2 } from "./cat-poses";
import type { DerivedCat } from "./derive-cat";
import type { CatBuild } from "./get-cat-build";
import type { LegSide } from "./leg-layout";

export type SimState =
  | "offstage"
  | "enter"
  | "approach"
  | "pause"
  | "settle"
  | "sit"
  | "sleep"
  | "sniff"
  | "paw"
  | "greet"
  | "chase"
  | "chased"
  | "bat"
  | "zoom"
  | "leave"
  | "flee";

export type RestPose = "sit" | "sleep";

export type ReachTarget =
  | { kind: "finger"; userId: string }
  | { kind: "tail"; catId: string };

export type Reach = {
  phase: "extend" | "pat" | "retract" | "hold" | "planted";
  t: number;
  notice: number;
  fromX: number;
  fromY: number;
  fromH: number;
  toX: number;
  toY: number;
  endH: number;
  durationSeconds: number;
  lift: number;
  target: ReachTarget;
  reactSeconds: number;
  kneadSeconds: number;
  waitSeconds: number;
};

export type Swing = {
  fromX: number;
  fromY: number;
  fromH: number;
  t: number;
  durationSeconds: number;
  lift: number;
};

export type SimLeg = {
  front: boolean;
  side: LegSide;
  x: number;
  y: number;
  h: number;
  idealX: number;
  idealY: number;
  gap: number;
  swing: Swing | undefined;
  reach: Reach | undefined;
};

export type Social =
  | {
      kind: "greet";
      t: number;
      sniffT: number;
      sniffing: boolean;
      lead: boolean;
      printed: boolean;
    }
  | { kind: "chase"; t: number; durationSeconds: number }
  | { kind: "chased"; t: number }
  | { kind: "bat"; t: number; durationSeconds: number; phase: "go" | "play" };

export type Point = { x: number; y: number };

export type SimCat = {
  userId: string;
  look: CatLook;
  build: CatBuild;
  x: number;
  y: number;
  heading: number;
  speed: number;
  speedTarget: number;
  angVel: number;
  bend: number;
  state: SimState;
  stateT: number;
  waitSeconds: number;
  pauseSeconds: number;
  rest: RestPose | undefined;
  weights: PoseWeights;
  /** The stand, sit and sleep poses blended by `weights`, before bend and breath. */
  pose: Pose;
  yaw: number;
  sniff: number;
  legs: [SimLeg, SimLeg, SimLeg, SimLeg];
  derived: DerivedCat;
  repositionDir: Vec2 | undefined;
  sniffCooldownSeconds: number;
  hasNosed: boolean;
  previousHeadGap: number;
  approachSpeed: number;
  curiosity: number;
  playful: number;
  /** The finger this cat is curious about, by its player's `userId`. */
  focusId: string | undefined;
  curiousUntil: number;
  curiousCooldownUntil: number;
  /** Pressed fingers this cat has its paws on, by player `userId`: one normally, two in a shared moment. */
  pawFingerIds: string[];
  social: Social | undefined;
  partnerId: string | undefined;
  isSnuggling: boolean;
  socialCooldownUntil: number;
  /** Sprints left in the current zoomies. */
  zoomDashes: number;
  zoomiesCooldownUntil: number;
  /** World time before which the cat makes no new sound, so sounds do not pile up. */
  quietUntil: number;
  wander: Point;
  exit: Point;
  /** `true` once its player has left, so the cat walks off and is removed; `false` while its player is in the room. */
  isDeparting: boolean;
};

/** One present fingertip as the host receives it, in world units. */
export type FingerInput = {
  userId: string;
  x: number;
  y: number;
  pressed: boolean;
  /** `true` when the fingertip skipped here from somewhere else this step, such as a new touch, so the step is not movement. */
  jumped?: boolean;
};

export type SimFinger = {
  userId: string;
  x: number;
  y: number;
  pressed: boolean;
  present: boolean;
  speed: number;
  stillSeconds: number;
  absentSeconds: number;
};

export type World = {
  random: () => number;
  /** Seconds since the world started. */
  time: number;
  width: number;
  height: number;
  cats: { [userId: string]: SimCat };
  fingers: { [userId: string]: SimFinger };
};

/** What one step needs: the world it changes, its length, and the events it reports. */
export type Tick = { world: World; dtSeconds: number; events: RoomEvent[] };
