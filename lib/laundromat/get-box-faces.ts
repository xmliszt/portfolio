import type { IsoProjection, ScreenPoint } from "./project-iso-point";
import { projectIsoPoint } from "./project-iso-point";
import type { IsoPoint, IsoSize } from "./scene-config";

const BEVEL_PX = 1.2;

/** Return the projected top, front (y-max) and side (x-max) faces of a box, its outline, and a `bevel` line inset on the top from the left silhouette corner past the near corner to the right one. */
export function getBoxFaces(options: {
  position: IsoPoint;
  size: IsoSize;
  projection: IsoProjection;
}) {
  const { x, y, z } = options.position;
  const { w, d, h } = options.size;
  const inset = BEVEL_PX / options.projection.unit;
  function at(point: IsoPoint): ScreenPoint {
    return projectIsoPoint({ point, projection: options.projection });
  }
  return {
    top: [
      at({ x, y, z: z + h }),
      at({ x: x + w, y, z: z + h }),
      at({ x: x + w, y: y + d, z: z + h }),
      at({ x, y: y + d, z: z + h }),
    ],
    front: [
      at({ x, y: y + d, z }),
      at({ x: x + w, y: y + d, z }),
      at({ x: x + w, y: y + d, z: z + h }),
      at({ x, y: y + d, z: z + h }),
    ],
    side: [
      at({ x: x + w, y, z }),
      at({ x: x + w, y: y + d, z }),
      at({ x: x + w, y: y + d, z: z + h }),
      at({ x: x + w, y, z: z + h }),
    ],
    outline: [
      at({ x, y, z: z + h }),
      at({ x: x + w, y, z: z + h }),
      at({ x: x + w, y, z }),
      at({ x: x + w, y: y + d, z }),
      at({ x, y: y + d, z }),
      at({ x, y: y + d, z: z + h }),
    ],
    bevel: [
      at({ x, y: y + d, z: z + h }),
      at({ x: x + w - inset, y: y + d - inset, z: z + h }),
      at({ x: x + w, y, z: z + h }),
    ],
  };
}
