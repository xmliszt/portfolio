import { BOARD_PANEL_BOTTOM_RATIO } from "./board/get-board-frame";
import type { SceneObject } from "./scene-config";

const TABLE_TOP_THICKNESS = 0.1;
const STOOL_SEAT_THICKNESS = 0.16;
const BOARD_PANEL = { front: 0.55, depth: 0.4 };
const FOOTPRINT_EDGES = [
  [
    { u: 0, v: 0 },
    { u: 1, v: 0 },
  ],
  [
    { u: 1, v: 0 },
    { u: 1, v: 1 },
  ],
  [
    { u: 1, v: 1 },
    { u: 0, v: 1 },
  ],
  [
    { u: 0, v: 1 },
    { u: 0, v: 0 },
  ],
] as const;

function getBlocker(object: SceneObject) {
  const { position, size } = object;
  function topSlab(thickness: number) {
    return {
      position: { ...position, z: position.z + size.h - thickness },
      size: { ...size, h: thickness },
    };
  }
  switch (object.kind) {
    case "window":
    case "mat":
    case "notebook":
    case "mug":
      return undefined;
    case "table":
      return topSlab(TABLE_TOP_THICKNESS);
    case "stool":
      return topSlab(STOOL_SEAT_THICKNESS);
    case "washer":
    case "dryer":
    case "counter":
    case "coffee-machine":
    case "tv":
    case "clock":
    case "tube-display":
    case "shelf":
    case "plant":
    case "basket":
      return { position, size };
    case "board":
      return {
        position: {
          ...position,
          y: position.y + size.d * BOARD_PANEL.front,
          z: position.z + size.h * BOARD_PANEL_BOTTOM_RATIO,
        },
        size: {
          ...size,
          d: size.d * BOARD_PANEL.depth,
          h: size.h * (1 - BOARD_PANEL_BOTTOM_RATIO),
        },
      };
    default: {
      const unknown: never = object;
      return unknown;
    }
  }
}

/** Return the floor polygons (iso `x`, `y`) whose union is the shadow `object` casts along `shadow` (the floor offset per unit of height), or `undefined` when it blocks no light. */
export function getObjectFloorShadow(options: {
  object: SceneObject;
  shadow: { x: number; y: number };
}) {
  const blocker = getBlocker(options.object);
  if (blocker === undefined) return undefined;
  const { position: p, size } = blocker;
  const { shadow } = options;
  function cast(corner: { u: number; v: number }, z: number) {
    return {
      x: p.x + corner.u * size.w + shadow.x * z,
      y: p.y + corner.v * size.d + shadow.y * z,
    };
  }
  const low = p.z;
  const high = p.z + size.h;
  return [
    FOOTPRINT_EDGES.map(([from]) => cast(from, low)),
    FOOTPRINT_EDGES.map(([from]) => cast(from, high)),
    ...FOOTPRINT_EDGES.map(([from, to]) => [
      cast(from, low),
      cast(to, low),
      cast(to, high),
      cast(from, high),
    ]),
  ];
}
