import { getBoxEdgeReach } from "./get-box-edge-reach";
import { releasePaws } from "./release-paws";
import { setCatState } from "./set-cat-state";
import type { SimCat, World } from "./sim-types";

/** Send `cat` into the box `boxId`, or the nearest box when it is not given, unless that box is missing or another cat is visiting it, or `cat` left a box before `boxCooldownUntil`; return `true` if it set off. */
export function startBoxVisit(options: {
  world: World;
  cat: SimCat;
  boxId?: string;
}) {
  const { world, cat } = options;
  if (world.time < cat.boxCooldownUntil) return false;
  const takenIds = new Set(
    Object.values(world.cats).flatMap((other) =>
      other !== cat && other.boxVisit !== undefined
        ? [other.boxVisit.boxId]
        : []
    )
  );
  const box = world.toys
    .filter(
      (toy) =>
        toy.kind === "box" &&
        !takenIds.has(toy.id) &&
        (options.boxId === undefined || toy.id === options.boxId)
    )
    .toSorted(
      (a, b) =>
        Math.hypot(a.x - cat.x, a.y - cat.y) -
        Math.hypot(b.x - cat.x, b.y - cat.y)
    )
    .at(0);
  if (box === undefined) return false;
  const gap = Math.max(1, Math.hypot(cat.x - box.x, cat.y - box.y));
  const reach = getBoxEdgeReach(cat.build.scale);
  releasePaws(cat);
  cat.focusId = undefined;
  cat.rest = undefined;
  setCatState(cat, "box");
  cat.boxVisit = {
    boxId: box.id,
    phase: "go",
    t: 0,
    from: {
      x: box.x + ((cat.x - box.x) / gap) * reach,
      y: box.y + ((cat.y - box.y) / gap) * reach,
    },
    to: { x: box.x, y: box.y },
    restSeconds: 30 + world.random() * 60,
  };
  return true;
}
