import type { ScreenPoint } from "./project-iso-point";

export function toSvgPoints(points: ScreenPoint[]) {
  return points.map((point) => `${point.x},${point.y}`).join(" ");
}
