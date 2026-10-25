import {
  type IsoProjection,
  projectIsoPoint,
} from "@/lib/laundromat/project-iso-point";
import type { IsoPoint, IsoSize } from "@/lib/laundromat/scene-config";

export function getCornerWeb(options: {
  position: IsoPoint;
  size: IsoSize;
  projection: IsoProjection;
}) {
  const { position, size, projection } = options;
  const anchors = [
    { x: 0, y: 0, z: 1 },
    { x: 0.45, y: 0, z: 1 },
    { x: 1, y: 0, z: 0.9 },
    { x: 0.8, y: 0, z: 0.3 },
    { x: 0, y: 0.8, z: 0.3 },
    { x: 0, y: 1, z: 0.9 },
    { x: 0, y: 0.45, z: 1 },
  ];
  const hub = { x: 0.25, y: 0.25, z: 0.58 };
  function at(point: IsoPoint) {
    const screen = projectIsoPoint({
      point: {
        x: position.x + size.w * point.x,
        y: position.y + size.d * point.y,
        z: position.z + size.h * point.z,
      },
      projection,
    });
    return `${screen.x},${screen.y}`;
  }
  function along(coordinates: { point: IsoPoint; amount: number }) {
    const { point, amount } = coordinates;
    return {
      x: hub.x + (point.x - hub.x) * amount,
      y: hub.y + (point.y - hub.y) * amount,
      z: hub.z + (point.z - hub.z) * amount,
    };
  }
  const spokes = anchors.map((anchor) => `M${at(hub)} L${at(anchor)}`);
  const rings = Array.from({ length: 7 }, (_, ring) => {
    const radius = (ring + 1) / 8;
    return anchors
      .map((anchor, index) => {
        const next = anchors.at((index + 1) % anchors.length) ?? anchor;
        const from = along({ point: anchor, amount: radius });
        const to = along({ point: next, amount: radius });
        const midpoint = {
          x: (from.x + to.x) / 2,
          y: (from.y + to.y) / 2,
          z: (from.z + to.z) / 2 - 0.045 * radius,
        };
        return `M${at(from)} Q${at(midpoint)} ${at(to)}`;
      })
      .join(" ");
  });
  return { spokes, rings };
}
