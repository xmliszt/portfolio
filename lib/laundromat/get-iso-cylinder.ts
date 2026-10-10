import { getIsoEllipse } from "./get-iso-ellipse";
import type { IsoProjection } from "./project-iso-point";

/** Return the top ellipse and the SVG `body` path (sides and front half of the base) of an upright cylinder, optionally tapered to `topRadius`. */
export function getIsoCylinder(options: {
  center: { x: number; y: number };
  bottom: number;
  top: number;
  radius: number;
  topRadius?: number;
  projection: IsoProjection;
}) {
  const { center, projection } = options;
  const base = getIsoEllipse({
    center: { ...center, z: options.bottom },
    radius: options.radius,
    projection,
  });
  const top = getIsoEllipse({
    center: { ...center, z: options.top },
    radius: options.topRadius ?? options.radius,
    projection,
  });
  const body = [
    `M ${top.cx - top.rx} ${top.cy}`,
    `L ${base.cx - base.rx} ${base.cy}`,
    `A ${base.rx} ${base.ry} 0 0 0 ${base.cx + base.rx} ${base.cy}`,
    `L ${top.cx + top.rx} ${top.cy}`,
    `A ${top.rx} ${top.ry} 0 0 1 ${top.cx - top.rx} ${top.cy}`,
    "Z",
  ].join(" ");
  return { base, top, body };
}
