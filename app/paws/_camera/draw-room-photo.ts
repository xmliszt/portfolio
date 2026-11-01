import type { ViewfinderFrame } from "@/lib/laundromat/instant-camera/viewfinder-frame";
import type { SceneResources } from "@/lib/paws/render/create-scene-resources";
import { drawScene } from "@/lib/paws/render/draw-scene";

import type { RoomScene } from "./room-scene";

/** Return a canvas `longPx` on its long edge with the part of `scene` under the window rectangle `frame` drawn again at that size, leaving out the visitor's own fingertip. */
export function drawRoomPhoto(options: {
  scene: RoomScene;
  frame: ViewfinderFrame;
  longPx: number;
  resources: SceneResources;
}) {
  const { scene, frame } = options;
  const dpr = options.longPx / Math.max(frame.width, frame.height);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(frame.width * dpr);
  canvas.height = Math.round(frame.height * dpr);
  const g = canvas.getContext("2d");
  if (g === null) throw new Error("no 2d canvas context");
  drawScene({
    ...scene,
    g,
    dpr,
    width: frame.width,
    height: frame.height,
    view: {
      ...scene.view,
      offsetX: scene.view.offsetX - frame.x,
      offsetY: scene.view.offsetY - frame.y,
    },
    fingers: scene.fingers.filter((finger) => finger.kind !== "own"),
    resources: options.resources,
  });
  return canvas;
}
