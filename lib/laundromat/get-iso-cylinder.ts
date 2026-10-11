import { getIsoEllipse } from "./get-iso-ellipse";
import type { IsoProjection, ScreenPoint } from "./project-iso-point";
import { projectIsoPoint } from "./project-iso-point";

export type CylinderFacet = { shade: 0 | 1 | 2 | 3; points: ScreenPoint[] };

const SHADES = [0, 1, 2, 3] as const;
const STEPS_PER_FACET = 8;
const QUARTER_TURN = Math.PI / 4;

/** Return the top ellipse, the SVG `body` path (sides and front half of the base) and the visible side split into four `facets` shaded by facing, of an upright cylinder optionally tapered to `topRadius`. */
export function getIsoCylinder(options: {
  center: { x: number; y: number };
  bottom: number;
  top: number;
  radius: number;
  topRadius?: number;
  projection: IsoProjection;
}) {
  const { center, projection } = options;
  const topRadius = options.topRadius ?? options.radius;
  const base = getIsoEllipse({
    center: { ...center, z: options.bottom },
    radius: options.radius,
    projection,
  });
  const top = getIsoEllipse({
    center: { ...center, z: options.top },
    radius: topRadius,
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
  function rim(ring: { angles: number[]; radius: number; z: number }) {
    return ring.angles.map((angle) =>
      projectIsoPoint({
        point: {
          x: center.x + ring.radius * Math.cos(angle),
          y: center.y + ring.radius * Math.sin(angle),
          z: ring.z,
        },
        projection,
      })
    );
  }
  // Lit like the boxes: the +x side (a box's `side`) is darkest, the +y side (its `front`) lightest.
  const facets = SHADES.map((shade): CylinderFacet => {
    const from = QUARTER_TURN + Math.asin(shade / 2 - 1);
    const to = QUARTER_TURN + Math.asin(shade / 2 - 0.5);
    const angles = Array.from(
      { length: STEPS_PER_FACET + 1 },
      (_, step) => from + ((to - from) * step) / STEPS_PER_FACET
    );
    return {
      shade,
      points: [
        ...rim({ angles, radius: options.radius, z: options.bottom }),
        ...rim({
          angles: angles.toReversed(),
          radius: topRadius,
          z: options.top,
        }),
      ],
    };
  });
  return { base, top, body, facets };
}
