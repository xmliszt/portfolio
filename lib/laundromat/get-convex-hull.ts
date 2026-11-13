import type { ScreenPoint } from "@/lib/laundromat/project-iso-point";

function cross(o: ScreenPoint, a: ScreenPoint, b: ScreenPoint) {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

function halfHull(points: ScreenPoint[]) {
  return points.reduce<ScreenPoint[]>((hull, point) => {
    const kept = [...hull];
    while (
      kept.length >= 2 &&
      cross(kept[kept.length - 2], kept[kept.length - 1], point) <= 0
    ) {
      kept.pop();
    }
    return [...kept, point];
  }, []);
}

/** Return the convex hull of `points` in order around its edge, without repeating the first point. */
export function getConvexHull(points: ScreenPoint[]) {
  const sorted = points.toSorted((a, b) => a.x - b.x || a.y - b.y);
  const lower = halfHull(sorted);
  const upper = halfHull(sorted.toReversed());
  return [...lower.slice(0, -1), ...upper.slice(0, -1)];
}
