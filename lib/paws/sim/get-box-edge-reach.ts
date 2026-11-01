import { BOX_CLEARANCE } from "./keep-cats-out-of-box";
import { TOY_LIMITS } from "./toy-limits";

const MARGIN = 5;

/** Return how far from the box's middle a cat at `scale` stands to hop in and lands when it hops out, in world units: far enough in any direction to clear `BOX_CLEARANCE`. */
export function getBoxEdgeReach(scale: number) {
  const { halfWidth, halfDepth } = TOY_LIMITS.box;
  return Math.hypot(halfWidth, halfDepth) + (BOX_CLEARANCE + MARGIN) * scale;
}
