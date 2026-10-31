import { createPawPrintMasks } from "./create-paw-print-masks";
import type { SceneResources } from "./create-scene-resources";
import { getContext2d } from "./get-context-2d";

/** Return paw print `variant` inked in `color`, tinting and keeping it in `resources` the first time it is asked for. */
export function getTintedPrint(options: {
  resources: SceneResources;
  color: string;
  variant: number;
}) {
  const { resources, color, variant } = options;
  const key = `${color}:${variant}`;
  const kept = resources.tintedPrints[key];
  if (kept !== undefined) return kept;
  const masks =
    resources.pawMasks ??
    createPawPrintMasks({ createCanvas: resources.createCanvas });
  resources.pawMasks = masks;
  const mask = masks[variant % masks.length];
  const canvas = resources.createCanvas({
    width: mask.width,
    height: mask.height,
  });
  const g = getContext2d(canvas);
  g.drawImage(mask, 0, 0);
  g.globalCompositeOperation = "source-in";
  g.fillStyle = color;
  g.fillRect(0, 0, canvas.width, canvas.height);
  resources.tintedPrints[key] = canvas;
  return canvas;
}
