import type { IsoPoint, IsoSize } from "./scene-config";

type Footprint = { position: IsoPoint; size: IsoSize };

/** `true` if `front`'s floor footprint lies wholly nearer the viewer than `back`'s along x or y while the two overlap on the other axis; `false` when they overlap on both axes or neither. */
export function isFootprintInFront(options: {
  front: Footprint;
  back: Footprint;
}) {
  const { front, back } = options;
  const overlapsX =
    front.position.x < back.position.x + back.size.w &&
    back.position.x < front.position.x + front.size.w;
  const overlapsY =
    front.position.y < back.position.y + back.size.d &&
    back.position.y < front.position.y + front.size.d;
  return (
    (overlapsX && front.position.y >= back.position.y + back.size.d) ||
    (overlapsY && front.position.x >= back.position.x + back.size.w)
  );
}
