import { getContext2d } from "./get-context-2d";
import type { AnyCanvas, AnyContext, CreateCanvas } from "./render-types";

export type Surface = { canvas: AnyCanvas; g: AnyContext };

/** Return a new canvas of `width` by `height` device pixels together with its 2D context. */
export function createSurface(options: {
  createCanvas: CreateCanvas;
  width: number;
  height: number;
}): Surface {
  const canvas = options.createCanvas({
    width: options.width,
    height: options.height,
  });
  return { canvas, g: getContext2d(canvas) };
}
