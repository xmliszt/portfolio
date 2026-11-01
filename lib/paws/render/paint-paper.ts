import { RISO } from "@/lib/paws/riso-inks";
import type { Sky } from "@/lib/paws/sky/sky-types";

import type { SceneResources } from "./create-scene-resources";
import { cutGrain } from "./cut-grain";
import { getPaperWashes } from "./get-paper-washes";
import { paintNight } from "./paint-night";
import { paintSkyFar } from "./paint-sky-far";
import { paintSunlight } from "./paint-sunlight";

const REPAINTS_PER_SECOND = 4;

const rgb = (hex: string) =>
  [1, 3, 5]
    .map((start) => Number.parseInt(hex.slice(start, start + 2), 16))
    .join(",");

/** Paint the paper with the ink washes from `getPaperWashes` at `time` seconds onto `resources.paper` for a `width` by `height` CSS pixel viewport, with the far sky, the sunlight and `resources.night` from `sky` when it is given, unless it is already painted for that size within the same `1 / REPAINTS_PER_SECOND` step. */
export function paintPaper(options: {
  resources: SceneResources;
  width: number;
  height: number;
  dpr: number;
  time: number;
  sky?: Sky;
}) {
  const { resources, width, height, dpr, time, sky } = options;
  const key = `${width}x${height}@${dpr}#${Math.floor(time * REPAINTS_PER_SECOND)}`;
  const { paper, wash } = resources;
  if (paper.paintedFor === key) return paper.canvas;
  const deviceWidth = Math.max(1, Math.round(width * dpr));
  const deviceHeight = Math.max(1, Math.round(height * dpr));
  paper.canvas.width = deviceWidth;
  paper.canvas.height = deviceHeight;
  wash.canvas.width = deviceWidth;
  wash.canvas.height = deviceHeight;
  const g = paper.g;
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.globalCompositeOperation = "source-over";
  g.globalAlpha = 1;
  g.fillStyle = RISO.paper;
  g.fillRect(0, 0, width, height);
  const washes = getPaperWashes({
    seed: resources.paperSeed,
    time,
    width,
    height,
    sky,
  });
  for (const ink of washes) {
    const w = wash.g;
    w.setTransform(1, 0, 0, 1, 0, 0);
    w.globalCompositeOperation = "source-over";
    w.clearRect(0, 0, deviceWidth, deviceHeight);
    w.setTransform(dpr, 0, 0, dpr, 0, 0);
    const gradient = w.createRadialGradient(
      ink.x,
      ink.y,
      ink.r0,
      ink.x,
      ink.y,
      ink.r1
    );
    gradient.addColorStop(0, `rgba(${rgb(ink.ink)},${ink.a0})`);
    gradient.addColorStop(1, `rgba(${rgb(ink.ink)},${ink.a1})`);
    w.fillStyle = gradient;
    w.fillRect(0, 0, width, height);
    cutGrain({
      g: w,
      grain: resources.grain,
      width,
      height,
      dpr,
      strength: 0.9,
    });
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalCompositeOperation = "multiply";
    g.drawImage(wash.canvas, 0, 0);
  }
  if (sky !== undefined) {
    const w = wash.g;
    w.setTransform(1, 0, 0, 1, 0, 0);
    w.globalCompositeOperation = "source-over";
    w.clearRect(0, 0, deviceWidth, deviceHeight);
    paintSkyFar({
      g: w,
      far: resources.skyFar,
      soft: resources.skySoft,
      sky,
      seed: resources.paperSeed,
      time,
      width,
      height,
      dpr,
    });
    cutGrain({
      g: w,
      grain: resources.grain,
      width,
      height,
      dpr,
      strength: 0.9,
    });
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalCompositeOperation = "multiply";
    g.drawImage(wash.canvas, 0, 0);
    paintSunlight({
      g,
      wash,
      mask: resources.sunMask,
      sky,
      width,
      height,
      dpr,
    });
  }
  resources.night.isDark =
    sky !== undefined &&
    paintNight({ night: resources.night, sky, width, height, dpr });
  g.globalCompositeOperation = "source-over";
  paper.paintedFor = key;
  return paper.canvas;
}
