import { getIsoEllipse } from "./get-iso-ellipse";
import type { IsoProjection } from "./project-iso-point";
import { projectIsoPoint } from "./project-iso-point";
import type { SceneObject } from "./scene-config";

const ROUND_HALO_RATIO = 0.8;

/** Return the screen shape of the soft shadow under `object` where it stands on the floor: an ellipse for round furniture, its footprint for boxes, or `undefined` when it is lifted, wall-mounted or flat. */
export function getFloorHalo(options: {
  object: SceneObject;
  projection: IsoProjection;
}) {
  const { object, projection } = options;
  const { position: p, size } = object;
  if (p.z !== 0) return undefined;
  switch (object.kind) {
    case "washer":
    case "dryer":
    case "counter":
      return {
        kind: "polygon" as const,
        points: [
          { x: p.x, y: p.y },
          { x: p.x + size.w, y: p.y },
          { x: p.x + size.w, y: p.y + size.d },
          { x: p.x, y: p.y + size.d },
        ].map((corner) =>
          projectIsoPoint({ point: { ...corner, z: 0 }, projection })
        ),
      };
    case "table":
    case "stool":
    case "plant":
    case "basket":
      return {
        kind: "ellipse" as const,
        ...getIsoEllipse({
          center: { x: p.x + size.w / 2, y: p.y + size.d / 2, z: 0 },
          radius: (Math.min(size.w, size.d) / 2) * ROUND_HALO_RATIO,
          projection,
        }),
      };
    case "mat":
    case "coffee-machine":
    case "tv":
    case "window":
    case "clock":
    case "shelf":
    case "notebook":
    case "mug":
      return undefined;
    default: {
      const unhandled: never = object;
      return unhandled;
    }
  }
}
