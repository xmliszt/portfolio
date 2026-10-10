import type { IsoProjection } from "./project-iso-point";
import { projectIsoPoint } from "./project-iso-point";
import type { IsoPoint } from "./scene-config";

const RX_PER_RADIUS = Math.SQRT2 * Math.cos(Math.PI / 6);
const RY_PER_RADIUS = Math.SQRT2 * Math.sin(Math.PI / 6);

/** Return the screen ellipse of a horizontal circle of `radius` iso units centred on `center`. */
export function getIsoEllipse(options: {
  center: IsoPoint;
  radius: number;
  projection: IsoProjection;
}) {
  const { x, y } = projectIsoPoint({
    point: options.center,
    projection: options.projection,
  });
  const scaled = options.radius * options.projection.unit;
  return {
    cx: x,
    cy: y,
    rx: scaled * RX_PER_RADIUS,
    ry: scaled * RY_PER_RADIUS,
  };
}
