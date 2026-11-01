import type { SceneResources } from "@/lib/paws/render/create-scene-resources";
import { drawScene } from "@/lib/paws/render/draw-scene";
import type { SceneFinger, WorldView } from "@/lib/paws/render/render-types";
import type { Sky } from "@/lib/paws/sky/sky-types";
import { deriveCat } from "@/lib/paws/sim/derive-cat";

import { mix } from "../../../engine/src/motion";
import type { TakeFrame, TakeResult } from "./run-take";

export type Camera = { x: number; y: number; zoom: number };
export type Point = { x: number; y: number };
export type CameraKey = { at: number; target: (frame: TakeFrame) => Point; zoom: number };

const clamp = (x: number) => Math.min(1, Math.max(0, x));

export function frameOf(result: TakeResult, simTime: number): TakeFrame {
  const index = Math.max(0, Math.min(result.frames.length - 1, Math.round(simTime * result.fps)));
  return result.frames[index]!;
}

/** Draw `take` at `simTime` with the real room renderer under `sky`, seen through `camera`, and return the cats and the view it used. */
export function drawRoom(options: { g: CanvasRenderingContext2D; width: number; height: number; take: TakeResult; simTime: number; camera: Camera; resources: SceneResources; sky?: Sky }) {
  const frame = frameOf(options.take, options.simTime);
  const cats = frame.snapshots.flatMap((snapshot) => {
    const look = frame.looks[snapshot.userId];
    return look === undefined ? [] : [deriveCat({ snapshot, look, time: frame.time })];
  });
  const fingers: SceneFinger[] = frame.fingers.map(({ userId, tip }) => ({ ...tip, kind: "remote", userId }));
  const scale = options.camera.zoom;
  const view: WorldView = { scale, offsetX: options.width / 2 - options.camera.x * scale, offsetY: options.height / 2 - options.camera.y * scale };
  options.resources.paper.paintedFor = undefined;
  drawScene({ g: options.g, width: options.width, height: options.height, dpr: 1, view, cats, prints: frame.prints, fingers, time: frame.time, resources: options.resources, sky: options.sky, toys: frame.toys, trails: frame.trails, toyMarks: frame.marks });
  return { cats, view, frame };
}

const smoother = (u: number) => {
  const x = clamp(u);
  return x * x * x * (x * (x * 6 - 15) + 10);
};

/** Return the camera at `t` on a dolly path through `keys`: position and log zoom ease between neighbours, and each key's target can follow the action. */
export function cameraOn(keys: CameraKey[], t: number, frame: TakeFrame): Camera {
  const next = keys.findIndex((key) => key.at > t);
  const a = keys[next === -1 ? keys.length - 1 : Math.max(0, next - 1)]!;
  const b = next <= 0 ? a : keys[next]!;
  const u = a === b ? 0 : smoother((t - a.at) / (b.at - a.at));
  const pa = a.target(frame);
  const pb = b.target(frame);
  return { x: mix(pa.x, pb.x, u), y: mix(pa.y, pb.y, u), zoom: Math.exp(mix(Math.log(a.zoom), Math.log(b.zoom), u)) };
}

/** Return the point `ahead` along cat `userId`'s heading and `side` across it, or the room's middle when the cat is away. */
export function catPoint(frame: TakeFrame, userId: string, ahead: number, side: number): Point {
  const cat = frame.snapshots.find((c) => c.userId === userId);
  if (cat === undefined) return { x: 800, y: 500 };
  const c = Math.cos(cat.heading);
  const s = Math.sin(cat.heading);
  return { x: cat.x + c * ahead - s * side, y: cat.y + s * ahead + c * side };
}
