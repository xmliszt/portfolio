import type { ScreenPoint } from "@/lib/laundromat/project-iso-point";

function signedArea(points: ScreenPoint[]) {
  return points.reduce((sum, point, index) => {
    const next = points[(index + 1) % points.length];
    return sum + point.x * next.y - next.x * point.y;
  }, 0);
}

/** Return the part of convex polygon `subject` inside convex polygon `clip`, as a polygon; an empty list when they do not overlap. */
export function clipConvexPolygon(options: {
  subject: ScreenPoint[];
  clip: ScreenPoint[];
}) {
  const { clip } = options;
  const orientation = Math.sign(signedArea(clip));
  return clip.reduce<ScreenPoint[]>((polygon, edgeStart, index) => {
    if (polygon.length === 0) return polygon;
    const edgeEnd = clip[(index + 1) % clip.length];
    const side = (point: ScreenPoint) =>
      orientation *
      ((edgeEnd.x - edgeStart.x) * (point.y - edgeStart.y) -
        (edgeEnd.y - edgeStart.y) * (point.x - edgeStart.x));
    const crossing = (a: ScreenPoint, b: ScreenPoint) => {
      const t = side(a) / (side(a) - side(b));
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    };
    return polygon.flatMap((current, pointIndex) => {
      const previous = polygon.at(pointIndex - 1) ?? current;
      const isInside = side(current) >= 0;
      const wasInside = side(previous) >= 0;
      if (isInside)
        return wasInside ? [current] : [crossing(previous, current), current];
      return wasInside ? [crossing(previous, current)] : [];
    });
  }, options.subject);
}
