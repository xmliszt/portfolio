import { getIsoCylinder } from "@/lib/laundromat/get-iso-cylinder";
import {
  type IsoProjection,
  projectIsoPoint,
} from "@/lib/laundromat/project-iso-point";
import type { IsoPoint, SceneDecoration } from "@/lib/laundromat/scene-config";

const LAYERS = [
  { kind: "leaf", count: 6, reach: 0.5, lift: 0.04, width: 0.34, turn: 0.3 },
  { kind: "bract", count: 7, reach: 0.44, lift: 0.1, width: 0.36, turn: 0 },
  { kind: "bract", count: 5, reach: 0.3, lift: 0.16, width: 0.42, turn: 0.6 },
] as const;

/** Return the pot and the leaves and bracts of a potted poinsettia filling `object`'s box, leaves sorted back to front, each turned by `rustle` radians. */
export function getPoinsettiaShape(options: {
  object: Extract<SceneDecoration, { kind: "poinsettia" }>;
  projection: IsoProjection;
  rustle: number;
}) {
  const { object, projection, rustle } = options;
  const { position, size } = object;
  const center = { x: position.x + size.w / 2, y: position.y + size.d / 2 };
  const radius = Math.min(size.w, size.d) / 2;
  const potTop = position.z + size.h * 0.38;
  const pot = getIsoCylinder({
    center,
    bottom: position.z,
    top: potTop,
    radius: radius * 0.52,
    topRadius: radius * 0.66,
    projection,
  });
  function project(point: IsoPoint) {
    return projectIsoPoint({ point, projection });
  }
  const crown = potTop + size.h * 0.06;
  const leaves = LAYERS.flatMap((layer, layerIndex) =>
    Array.from({ length: layer.count }, (_, index) => {
      const angle =
        (index / layer.count) * Math.PI * 2 +
        layer.turn +
        rustle * (layerIndex % 2 === 0 ? 1 : -1) * (1 + (index % 3) * 0.3);
      const along = { x: Math.cos(angle), y: Math.sin(angle) };
      const across = { x: -along.y, y: along.x };
      const reach = radius * 2 * layer.reach;
      const half = reach * layer.width * 0.5;
      const z = crown + size.h * layer.lift;
      const base = project({ ...center, z });
      const tip = project({
        x: center.x + along.x * reach,
        y: center.y + along.y * reach,
        z: z + size.h * 0.12 - reach * 0.35,
      });
      const sides = [-1, 1].map((side) =>
        project({
          x: center.x + along.x * reach * 0.5 + across.x * half * side,
          y: center.y + along.y * reach * 0.5 + across.y * half * side,
          z: z + size.h * 0.1,
        })
      );
      const [left, right] = sides;
      const facing = along.x * -0.2 + along.y * 0.8;
      return {
        kind: layer.kind,
        d: `M${base.x},${base.y} Q${left.x},${left.y} ${tip.x},${tip.y} Q${right.x},${right.y} ${base.x},${base.y}Z`,
        vein: `M${base.x},${base.y} L${tip.x},${tip.y}`,
        shade: facing > 0.35 ? 0 : facing > -0.2 ? 1 : 2,
        depth: layerIndex * 10 + along.x + along.y,
      };
    })
  ).toSorted((a, b) => a.depth - b.depth);
  const middle = project({ ...center, z: crown + size.h * 0.2 });
  const flowers = [
    { x: 0, y: 0 },
    { x: -1, y: 0.4 },
    { x: 1, y: 0.3 },
    { x: 0.3, y: -0.7 },
    { x: -0.5, y: -0.5 },
  ].map((offset) => ({
    x: middle.x + offset.x * radius * projection.unit * 0.09,
    y: middle.y + offset.y * radius * projection.unit * 0.07,
  }));
  return {
    pot,
    leaves,
    flowers,
    flowerRadius: radius * projection.unit * 0.04,
    base: project({ ...center, z: position.z }),
  };
}
