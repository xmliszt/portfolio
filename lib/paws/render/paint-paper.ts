import { RISO } from "@/lib/paws/riso-inks";

import type { SceneResources } from "./create-scene-resources";
import { cutGrain } from "./cut-grain";

const rgb = (hex: string) =>
  [1, 3, 5]
    .map((start) => Number.parseInt(hex.slice(start, start + 2), 16))
    .join(",");

/** Paint the paper with its blue, yellow and pink ink washes onto `resources.paper` for a `width` by `height` CSS pixel viewport, unless it is already painted for that size. */
export function paintPaper(options: {
  resources: SceneResources;
  width: number;
  height: number;
  dpr: number;
}) {
  const { resources, width, height, dpr } = options;
  const key = `${width}x${height}@${dpr}`;
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
  const longest = Math.max(width, height);
  const washes = [
    {
      ink: rgb(RISO.blue),
      x: width * 0.5,
      y: height * 0.45,
      r0: Math.min(width, height) * 0.15,
      r1: longest * 0.8,
      a0: 0,
      a1: 0.26,
    },
    {
      ink: rgb(RISO.yellow),
      x: width * 0.84,
      y: height * 0.08,
      r0: 0,
      r1: longest * 0.5,
      a0: 0.38,
      a1: 0,
    },
    {
      ink: rgb(RISO.pink),
      x: width * 0.05,
      y: height * 0.98,
      r0: 0,
      r1: longest * 0.45,
      a0: 0.14,
      a1: 0,
    },
  ];
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
    gradient.addColorStop(0, `rgba(${ink.ink},${ink.a0})`);
    gradient.addColorStop(1, `rgba(${ink.ink},${ink.a1})`);
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
  g.globalCompositeOperation = "source-over";
  paper.paintedFor = key;
  return paper.canvas;
}
