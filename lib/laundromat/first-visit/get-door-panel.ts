import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import { projectIsoPoint } from "@/lib/laundromat/project-iso-point";

import type { BedroomConfig } from "./bedroom-config";

const COS_30 = Math.cos(Math.PI / 6);
const SIN_30 = Math.sin(Math.PI / 6);
const SHADE_PER_SIN = 0.35;

/** Return the SVG `transform` that maps door-local units (across from the hinge, down from the top) onto the panel swung `angleDeg` into the room about its hinge on the `x = 0` wall, the panel's free-edge polygon and its shade opacity. */
export function getDoorPanel(options: {
  angleDeg: number;
  door: BedroomConfig["door"];
  projection: IsoProjection;
}) {
  const { door, projection } = options;
  const { unit } = projection;
  const theta = (options.angleDeg * Math.PI) / 180;
  const sin = Math.sin(theta);
  const cos = Math.cos(theta);
  const hingeY = door.fromY + door.width;
  const top = projectIsoPoint({
    point: { x: 0, y: hingeY, z: door.height },
    projection,
  });
  function onFreeEdge(options: { z: number; back: number }) {
    return projectIsoPoint({
      point: {
        x: door.width * sin - options.back * cos,
        y: hingeY - door.width * cos - options.back * sin,
        z: options.z,
      },
      projection,
    });
  }
  const across = {
    x: (sin + cos) * COS_30 * unit,
    y: (sin - cos) * SIN_30 * unit,
  };
  return {
    transform: `matrix(${across.x} ${across.y} 0 ${unit} ${top.x} ${top.y})`,
    edge: [
      onFreeEdge({ z: 0, back: 0 }),
      onFreeEdge({ z: door.height, back: 0 }),
      onFreeEdge({ z: door.height, back: door.thickness }),
      onFreeEdge({ z: 0, back: door.thickness }),
    ],
    shade: sin * SHADE_PER_SIN,
  };
}
