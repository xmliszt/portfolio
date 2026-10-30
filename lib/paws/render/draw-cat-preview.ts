import type { CatLook } from "@/lib/paws/cat-look";
import { blendPose } from "@/lib/paws/sim/blend-pose";
import { catToWorld } from "@/lib/paws/sim/cat-to-world";
import { deriveCat } from "@/lib/paws/sim/derive-cat";
import { getCatBuild } from "@/lib/paws/sim/get-cat-build";
import { hashUnit } from "@/lib/paws/sim/hash-unit";
import type { CatSnapshot, LegSnapshot } from "@/lib/paws/wire-types";

import {
  createSceneResources,
  type SceneResources,
} from "./create-scene-resources";
import { drawScene } from "./draw-scene";

const PREVIEW_ID = "preview";
const SITTING = { stand: 0, sit: 1, sleep: 0 };
const FACING_UP = -Math.PI / 2;
/** World units across the largest sitting cat, tail curl included; every size is drawn at the same zoom so size steps show. */
const LARGEST_CAT_SPAN = 160;
/** How far behind the hips the middle of a sitting cat's outline lies, in cat-local units. */
const SITTING_CENTER_X = -16;

const resourcesByCanvas = new WeakMap<object, SceneResources>();

const getResources = (g: CanvasRenderingContext2D) => {
  const kept = resourcesByCanvas.get(g.canvas);
  if (kept !== undefined) return kept;
  const resources = createSceneResources({
    createCanvas: ({ width, height }) => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      return canvas;
    },
  });
  resourcesByCanvas.set(g.canvas, resources);
  return resources;
};

/** Draw one cat sitting centered under the glass on the paper background, breathing and swaying its tail at `time` seconds. */
export function drawCatPreview(options: {
  g: CanvasRenderingContext2D;
  look: CatLook;
  width: number;
  height: number;
  time: number;
  dpr: number;
}) {
  const { g, look, width, height, time } = options;
  const scale = getCatBuild(look).scale;
  const frame = {
    x: 0,
    y: SITTING_CENTER_X * scale,
    heading: FACING_UP,
    scale,
  };
  const pose = blendPose(SITTING);
  const restingLeg = (offset: [number, number]): LegSnapshot => {
    const [x, y] = catToWorld(frame, offset);
    return { x, y, h: 0 };
  };
  const snapshot: CatSnapshot = {
    userId: PREVIEW_ID,
    x: frame.x,
    y: frame.y,
    heading: FACING_UP,
    speed: 0,
    bend: 0,
    pose: SITTING,
    yaw: Math.sin(time * 0.6 + hashUnit(PREVIEW_ID) * 100) * 0.15,
    sniff: 0,
    legs: [
      restingLeg(pose.front[0]),
      restingLeg(pose.front[1]),
      restingLeg(pose.hind[0]),
      restingLeg(pose.hind[1]),
    ],
    activity: "sit",
  };
  const zoom = (Math.min(width, height) * 0.82) / LARGEST_CAT_SPAN;
  drawScene({
    g,
    width,
    height,
    dpr: options.dpr,
    view: { scale: zoom, offsetX: width / 2, offsetY: height / 2 },
    cats: [deriveCat({ snapshot, look, time })],
    prints: [],
    fingers: [],
    time,
    resources: getResources(g),
  });
}
