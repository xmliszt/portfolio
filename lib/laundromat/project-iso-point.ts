import type { IsoPoint } from "./scene-config";

export type ScreenPoint = { x: number; y: number };

export type IsoProjection = { unit: number; origin: ScreenPoint };

const COS_30 = Math.cos(Math.PI / 6);
const SIN_30 = Math.sin(Math.PI / 6);

/** Return the scene-pixel position of `point`, with +x running down-right, +y down-left and +z up. */
export function projectIsoPoint(options: {
  point: IsoPoint;
  projection: IsoProjection;
}) {
  const { point, projection } = options;
  return {
    x: (point.x - point.y) * COS_30 * projection.unit + projection.origin.x,
    y:
      (point.x + point.y) * SIN_30 * projection.unit -
      point.z * projection.unit +
      projection.origin.y,
  };
}
