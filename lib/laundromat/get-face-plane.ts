import type { IsoProjection, ScreenPoint } from "./project-iso-point";
import { projectIsoPoint } from "./project-iso-point";
import type { IsoPoint } from "./scene-config";

const COS_30 = Math.cos(Math.PI / 6);
const SIN_30 = Math.sin(Math.PI / 6);

const PLANE_AXES = {
  front: { across: { x: COS_30, y: SIN_30 }, down: { x: 0, y: 1 } },
  side: { across: { x: COS_30, y: -SIN_30 }, down: { x: 0, y: 1 } },
  top: { across: { x: COS_30, y: SIN_30 }, down: { x: -COS_30, y: SIN_30 } },
} satisfies {
  [plane: string]: { across: ScreenPoint; down: ScreenPoint };
};

export type FacePlane = keyof typeof PLANE_AXES;

export type FaceRect = { x: number; y: number; width: number; height: number };

/** Return the SVG `transform` and `toScene` mapping from face pixels to scene pixels for `plane` (`front` faces +y, `side` +x, `top` +z) with its top-left corner, as seen, at `origin`. */
export function getFacePlane(options: {
  plane: FacePlane;
  origin: IsoPoint;
  projection: IsoProjection;
}) {
  const { across, down } = PLANE_AXES[options.plane];
  const origin = projectIsoPoint({
    point: options.origin,
    projection: options.projection,
  });
  function toScene(point: ScreenPoint) {
    return {
      x: origin.x + point.x * across.x + point.y * down.x,
      y: origin.y + point.x * across.y + point.y * down.y,
    };
  }
  function toOutline(rect: FaceRect) {
    return [
      { x: rect.x, y: rect.y },
      { x: rect.x + rect.width, y: rect.y },
      { x: rect.x + rect.width, y: rect.y + rect.height },
      { x: rect.x, y: rect.y + rect.height },
    ].map(toScene);
  }
  return {
    transform: `matrix(${across.x} ${across.y} ${down.x} ${down.y} ${origin.x} ${origin.y})`,
    toScene,
    toOutline,
  };
}
