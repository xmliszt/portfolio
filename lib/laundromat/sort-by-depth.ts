import type { IsoPoint } from "./scene-config";

/** Return a copy of `items` in paint order, back to front: smaller `x + y` first, then lower `z`. */
export function sortByDepth<T extends { position: IsoPoint }>(items: T[]) {
  return items.toSorted(
    (a, b) =>
      a.position.x + a.position.y - (b.position.x + b.position.y) ||
      a.position.z - b.position.z
  );
}
