import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import { projectIsoPoint } from "@/lib/laundromat/project-iso-point";

/** Return the scene-pixel outline of the front-facing rectangle `rect` at depth `y`, and its `bounds`. */
export function getBookshelfFaceOutline(options: {
  rect: { x0: number; x1: number; z0: number; z1: number };
  y: number;
  projection: IsoProjection;
}) {
  const { rect, y, projection } = options;
  const outline = [
    { x: rect.x0, z: rect.z1 },
    { x: rect.x1, z: rect.z1 },
    { x: rect.x1, z: rect.z0 },
    { x: rect.x0, z: rect.z0 },
  ].map(({ x, z }) => projectIsoPoint({ point: { x, y, z }, projection }));
  const xs = outline.map((point) => point.x);
  const ys = outline.map((point) => point.y);
  const x = Math.min(...xs);
  const top = Math.min(...ys);
  return {
    outline,
    bounds: {
      x,
      y: top,
      width: Math.max(...xs) - x,
      height: Math.max(...ys) - top,
    },
  };
}
