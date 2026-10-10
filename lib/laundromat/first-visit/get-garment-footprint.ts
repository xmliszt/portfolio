import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import { projectIsoPoint } from "@/lib/laundromat/project-iso-point";

import type { Garment } from "./bedroom-config";

const UNIT_SQUARE = [
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 1, y: 1 },
  { x: 0, y: 1 },
];

/** Return the floor-plane SVG `transform` of `garment`'s unit-square drawing, its projected centre and its screen bounds. */
export function getGarmentFootprint(options: {
  garment: Garment;
  projection: IsoProjection;
}) {
  const { garment, projection } = options;
  const angle = (garment.rotateDeg * Math.PI) / 180;
  const corners = UNIT_SQUARE.map((corner) => {
    const local = {
      x: (corner.x - 0.5) * garment.scale.x,
      y: (corner.y - 0.5) * garment.scale.y,
    };
    return projectIsoPoint({
      point: {
        x: garment.at.x + local.x * Math.cos(angle) - local.y * Math.sin(angle),
        y: garment.at.y + local.x * Math.sin(angle) + local.y * Math.cos(angle),
        z: 0,
      },
      projection,
    });
  });
  const xs = corners.map((corner) => corner.x);
  const ys = corners.map((corner) => corner.y);
  const left = Math.min(...xs);
  const top = Math.min(...ys);
  return {
    transform: `translate(${garment.at.x} ${garment.at.y}) rotate(${garment.rotateDeg}) scale(${garment.scale.x} ${garment.scale.y}) translate(-0.5 -0.5)`,
    center: projectIsoPoint({ point: { ...garment.at, z: 0 }, projection }),
    bounds: {
      x: left,
      y: top,
      width: Math.max(...xs) - left,
      height: Math.max(...ys) - top,
    },
  };
}
