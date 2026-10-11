import type { ScreenPoint } from "@/lib/laundromat/project-iso-point";

/** Return the smallest scale about `options.center` at which the convex `options.polygon` covers the view, given as the view's `left`, `right`, `top` and `bottom` distances from that point, or `Infinity` when the centre is not inside the polygon. */
export function getCoverScale(options: {
  polygon: ScreenPoint[];
  center: ScreenPoint;
  view: { left: number; right: number; top: number; bottom: number };
}) {
  const { polygon, center, view } = options;
  const area = polygon.reduce((sum, point, index) => {
    const next = polygon[(index + 1) % polygon.length];
    return sum + point.x * next.y - next.x * point.y;
  }, 0);
  const winding = Math.sign(area);
  const offsets = [
    { x: -view.left, y: -view.top },
    { x: view.right, y: -view.top },
    { x: view.right, y: view.bottom },
    { x: -view.left, y: view.bottom },
  ];
  return polygon.reduce((scale, point, index) => {
    const next = polygon[(index + 1) % polygon.length];
    const inward = {
      x: -(next.y - point.y) * winding,
      y: (next.x - point.x) * winding,
    };
    const clearance =
      inward.x * (center.x - point.x) + inward.y * (center.y - point.y);
    if (clearance <= 0) return Infinity;
    return offsets.reduce((edgeScale, offset) => {
      const reach = -(inward.x * offset.x + inward.y * offset.y);
      return Math.max(edgeScale, reach / clearance);
    }, scale);
  }, 0);
}
