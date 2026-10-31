import { dropSocial } from "./drop-social";
import { releasePaws } from "./release-paws";
import { setCatState } from "./set-cat-state";
import type { Point, SimCat, World } from "./sim-types";

/** Send `cat` off the glass: walking to the nearest edge, or running straight away from `fleeFrom` when given. */
export function startLeaving(options: {
  world: World;
  cat: SimCat;
  fleeFrom?: Point;
}) {
  const { world, cat, fleeFrom } = options;
  dropSocial({ world, cat });
  releasePaws(cat);
  cat.focusId = undefined;
  cat.pawFingerIds = [];
  cat.rest = undefined;
  if (fleeFrom !== undefined) {
    const gap = Math.max(1, Math.hypot(fleeFrom.x - cat.x, fleeFrom.y - cat.y));
    cat.exit = {
      x: cat.x + ((cat.x - fleeFrom.x) / gap) * 3000,
      y: cat.y + ((cat.y - fleeFrom.y) / gap) * 3000,
    };
    setCatState(cat, "flee");
    return;
  }
  const edges = [
    { gap: cat.x, x: -3000, y: cat.y },
    { gap: world.width - cat.x, x: world.width + 3000, y: cat.y },
    { gap: cat.y, x: cat.x, y: -3000 },
    { gap: world.height - cat.y, x: cat.x, y: world.height + 3000 },
  ].toSorted((a, b) => a.gap - b.gap);
  cat.exit = { x: edges[0].x, y: edges[0].y };
  setCatState(cat, "leave");
}
