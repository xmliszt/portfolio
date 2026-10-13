import type { IsoPoint } from "@/lib/laundromat/scene-config";

import type { getCurtainLayout } from "./get-curtain-layout";
import { getPleatDepth } from "./get-pleat-depth";

/** Return one panel's fold columns, wall end first: a column at each ring on the rod plane and one at each pleat between them, set back by the pleat's depth, each with its `top` at the rod and its `bottom` at the hem. `end` names the side of the opening the panel stacks past (`opening.near` or `opening.far`). */
export function getCurtainFolds(options: {
  rings: number[];
  hem: number[];
  layout: ReturnType<typeof getCurtainLayout>;
  stackOutset: number;
  fabric: number;
  end: "near" | "far";
}) {
  const { layout, stackOutset, fabric, end } = options;
  function at(point: { distance: number; gap?: number; z: number }) {
    const depth =
      point.gap === undefined ? 0 : getPleatDepth({ gap: point.gap, fabric });
    return {
      x: layout.rodX - depth,
      y:
        end === "far"
          ? layout.opening.far + stackOutset - point.distance
          : layout.opening.near - stackOutset + point.distance,
      z: point.z,
    } satisfies IsoPoint;
  }
  return options.rings.flatMap((ring, index) => {
    const hem = options.hem[index]!;
    const ringColumn = {
      isRing: true,
      top: at({ distance: ring, z: layout.top }),
      bottom: at({ distance: hem, z: layout.bottom }),
    };
    const nextRing = options.rings[index + 1];
    const nextHem = options.hem[index + 1];
    if (nextRing === undefined || nextHem === undefined) return [ringColumn];
    return [
      ringColumn,
      {
        isRing: false,
        top: at({
          distance: (ring + nextRing) / 2,
          gap: nextRing - ring,
          z: layout.top,
        }),
        bottom: at({
          distance: (hem + nextHem) / 2,
          gap: nextHem - hem,
          z: layout.bottom,
        }),
      },
    ];
  });
}
