import type { CatLook } from "@/lib/paws/cat-look";
import { createToyMarks } from "@/lib/paws/client/create-toy-marks";
import { pruneScenePrints } from "@/lib/paws/render/prune-scene-prints";
import type { FingertipState, ScenePrint } from "@/lib/paws/render/render-types";
import type { ToyMarks } from "@/lib/paws/render/toy-marks";
import { stepFingertip } from "@/lib/paws/render/step-fingertip";
import { toScenePrint } from "@/lib/paws/render/to-scene-print";
import { createResidentWorld } from "@/lib/paws/sim/create-resident-world";
import { createSeededRandom } from "@/lib/paws/sim/create-seeded-random";
import { deriveCat } from "@/lib/paws/sim/derive-cat";
import { getCatSnapshots } from "@/lib/paws/sim/get-cat-snapshots";
import { getToySnapshots } from "@/lib/paws/sim/get-toy-snapshots";
import { getToyTrails } from "@/lib/paws/sim/get-toy-trails";
import type { World } from "@/lib/paws/sim/sim-types";
import { stepWorld } from "@/lib/paws/sim/step-world";
import type { CatSnapshot, RoomEvent, ToySnapshot, ToyTrail } from "@/lib/paws/wire-types";


export type TakePlayer = {
  userId: string;
  look: CatLook;
  /** Later looks, each from its sim time on. */
  restyles?: [number, CatLook][];
  joinAt?: number;
  leaveAt?: number;
};

const lookAt = (player: TakePlayer, t: number) =>
  (player.restyles ?? []).filter(([at]) => at <= t).at(-1)?.[1] ?? player.look;

/** A scripted finger: where it is at sim time `t`, or `undefined` while it is away. */
export type TakeFinger = {
  userId: string;
  at: (t: number) => { x: number; y: number; pressed: boolean } | undefined;
};

export type Take = {
  seed: number;
  seconds: number;
  /** Simulation steps per sim second; higher for takes played back in slow motion. */
  fps: number;
  /** Cats standing in the room at sim time 0. */
  residents: TakePlayer[];
  /** Cats that walk in from an edge at `joinAt`. */
  visitors?: TakePlayer[];
  fingers?: TakeFinger[];
  /** Boxes, bowls and toys in the room at sim time 0; none when left out. */
  toys?: ToySnapshot[];
  /** Changes made to the world at given sim times, such as starting zoomies. */
  directions?: { at: number; run: (world: World) => void }[];
  /** Sim seconds the take runs before its scene is on screen, when it differs from the film's usual lead. */
  lead?: number;
  /** Runs after every step, for rules the sim leaves to chance, such as a cat always batting a toy it paws. */
  watch?: (world: World) => void;
  /** Runs once after the world is made, before the first step. */
  setup?: (world: World) => void;
};

export type TakeFrame = {
  snapshots: CatSnapshot[];
  fingers: { userId: string; tip: FingertipState }[];
  prints: ScenePrint[];
  toys: ToySnapshot[];
  trails: ToyTrail[];
  marks: ToyMarks;
  events: RoomEvent[];
  time: number;
  looks: { [userId: string]: CatLook };
  states: { [userId: string]: string };
};

export type TakeResult = { frames: TakeFrame[]; fps: number; looks: { [userId: string]: CatLook } };

/** Run `take` through the real room simulation at `take.fps` steps a second and return what every step shows. */
export function runTake(take: Take, onStep?: (world: World) => void): TakeResult {
  const random = createSeededRandom({ seed: take.seed });
  const world = createResidentWorld({ random, players: take.residents, toys: take.toys ?? [] });
  const toyMarks = createToyMarks();
  take.setup?.(world);
  const dt = 1 / take.fps;
  const steps = Math.round(take.seconds * take.fps);
  const looks = Object.fromEntries(
    [...take.residents, ...(take.visitors ?? [])].map((p) => [p.userId, p.look])
  );
  const tips: { [userId: string]: FingertipState | undefined } = {};
  const wasPressed: { [userId: string]: boolean } = {};
  const pending = (take.directions ?? []).toSorted((a, b) => a.at - b.at);
  let prints: ScenePrint[] = [];
  const frames: TakeFrame[] = [];
  for (let i = 0; i < steps; i++) {
    const t = i * dt;
    while (pending.length > 0 && (pending[0]?.at ?? Infinity) <= t) pending.shift()?.run(world);
    const players = [
      ...take.residents.filter((p) => p.leaveAt === undefined || t < p.leaveAt),
      ...(take.visitors ?? []).filter(
        (p) => (p.joinAt ?? 0) <= t && (p.leaveAt === undefined || t < p.leaveAt)
      ),
    ].map((p) => ({ userId: p.userId, look: lookAt(p, t) }));
    const frameLooks = Object.fromEntries(players.map((p) => [p.userId, p.look]));
    const inputs = (take.fingers ?? []).map((finger) => ({ finger, point: finger.at(t) }));
    const { events } = stepWorld({
      world,
      players,
      fingers: inputs.flatMap(({ finger, point }) =>
        point === undefined ? [] : [{ userId: finger.userId, ...point }]
      ),
      dtSeconds: dt,
    });
    take.watch?.(world);
    const fingerPrints: RoomEvent[] = [];
    const fingers = inputs.map(({ finger, point }) => {
      const tip = stepFingertip({
        fingertip: tips[finger.userId],
        input: {
          x: point?.x ?? tips[finger.userId]?.x ?? 0,
          y: point?.y ?? tips[finger.userId]?.y ?? 0,
          present: point !== undefined,
          pressed: point?.pressed ?? false,
        },
        dtSeconds: dt,
      });
      tips[finger.userId] = tip;
      const pressed = point?.pressed ?? false;
      if (wasPressed[finger.userId] && !pressed && tip.press >= 0.2)
        fingerPrints.push({ kind: "fingerPrint", userId: finger.userId, x: tip.x, y: tip.y, pressure: tip.press });
      wasPressed[finger.userId] = pressed;
      return { userId: finger.userId, tip };
    });
    const all = [...events, ...fingerPrints];
    for (const event of all) {
      const print = toScenePrint({
        event,
        look: "userId" in event ? (frameLooks[event.userId] ?? looks[event.userId]) : undefined,
        time: world.time,
      });
      if (print !== undefined) prints = [...prints, print];
    }
    prints = pruneScenePrints({ prints, time: world.time });
    const snapshots = getCatSnapshots(world);
    const toys = getToySnapshots(world);
    const marks = toyMarks.step({
      toys,
      cats: snapshots.flatMap((snapshot) => {
        const look = frameLooks[snapshot.userId] ?? looks[snapshot.userId];
        return look === undefined ? [] : [deriveCat({ snapshot, look, time: world.time })];
      }),
      time: world.time,
    });
    frames.push({
      snapshots,
      fingers,
      prints,
      toys,
      trails: getToyTrails(world),
      marks: { wetPrints: marks.wetPrints, ripples: marks.ripples },
      events: all,
      time: world.time,
      looks: { ...looks, ...frameLooks },
      states: Object.fromEntries(Object.values(world.cats).map((cat) => [cat.userId, cat.state])),
    });
    onStep?.(world);
  }
  return { frames, fps: take.fps, looks };
}
