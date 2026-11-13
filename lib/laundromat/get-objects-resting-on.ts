import type { IsoPoint, IsoSize } from "./scene-config";

type Footprint = { id: string; position: IsoPoint; size: IsoSize };

const SURFACE_TOLERANCE = 0.05;

function isOnTopOf(object: Footprint, base: Footprint) {
  const top = base.position.z + base.size.h;
  return (
    object.position.x < base.position.x + base.size.w &&
    base.position.x < object.position.x + object.size.w &&
    object.position.y < base.position.y + base.size.d &&
    base.position.y < object.position.y + object.size.d &&
    Math.abs(object.position.z - top) <= SURFACE_TOLERANCE
  );
}

/** Return the `objects` that stand on the top of `base`, or on something standing on it, in the order given. */
export function getObjectsRestingOn<T extends Footprint>(options: {
  base: Footprint;
  objects: T[];
}) {
  const grow = (supports: Footprint[]): T[] => {
    const resting = options.objects.filter(
      (object) =>
        object.id !== options.base.id &&
        supports.some((support) => isOnTopOf(object, support))
    );
    return resting.length + 1 === supports.length
      ? resting
      : grow([options.base, ...resting]);
  };
  return grow([options.base]);
}
