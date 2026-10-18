import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import { projectIsoPoint } from "@/lib/laundromat/project-iso-point";
import type { IsoPoint } from "@/lib/laundromat/scene-config";

import { getToyFaceTone } from "./get-toy-face-tone";
import { TOY_CAR_MESH } from "./toy-car-mesh";
import type { ToyCarPose } from "./toy-car-pose";

const DECAL_BIAS = 0.002;

/** Return the toy car's faces that face the viewer at `pose`, projected to scene pixels and in paint order (wheels on the far side, then the body, then wheels on the near side, each back to front), each with its index in `TOY_CAR_MESH`, part and tone. */
export function projectToyCar(options: {
  pose: ToyCarPose;
  projection: IsoProjection;
}) {
  const { center, forward, up } = options.pose;
  const right = {
    x: forward.y * up.z - forward.z * up.y,
    y: forward.z * up.x - forward.x * up.z,
    z: forward.x * up.y - forward.y * up.x,
  };
  function toWorld(point: IsoPoint) {
    return {
      x: right.x * point.x + forward.x * point.y + up.x * point.z,
      y: right.y * point.x + forward.y * point.y + up.y * point.z,
      z: right.z * point.x + forward.z * point.y + up.z * point.z,
    };
  }
  const nearSide = right.x + right.y + right.z >= 0 ? 1 : -1;
  function layerOf(wheelSide: 1 | -1 | undefined) {
    if (wheelSide === undefined) return 1;
    return wheelSide === nearSide ? 2 : 0;
  }
  return TOY_CAR_MESH.flatMap((face, index) => {
    const normal = toWorld(face.normal);
    if (normal.x + normal.y + normal.z <= 0) return [];
    const points = face.points.map((point) => {
      const offset = toWorld(point);
      return {
        x: center.x + offset.x,
        y: center.y + offset.y,
        z: center.z + offset.z,
      };
    });
    const depth =
      points.reduce((sum, point) => sum + point.x + point.y + point.z, 0) /
        points.length +
      (face.decal ? DECAL_BIAS : 0);
    return [
      {
        index,
        layer: layerOf(face.wheelSide),
        part: face.part,
        tone: getToyFaceTone(normal),
        depth,
        points: points.map((point) =>
          projectIsoPoint({ point, projection: options.projection })
        ),
      },
    ];
  }).toSorted((a, b) => a.layer - b.layer || a.depth - b.depth);
}
