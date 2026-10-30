import type { AnyCanvas, AnyContext } from "./render-types";

/** Return the 2D drawing context of `canvas`, throwing when the browser cannot give one. */
export function getContext2d(canvas: AnyCanvas): AnyContext {
  const g = canvas.getContext("2d");
  if (g === null) throw new Error("Canvas 2D is not available");
  return g;
}
