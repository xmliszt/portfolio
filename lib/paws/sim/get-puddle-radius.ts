import type { ToySpill } from "@/lib/paws/wire-types";

import { createSeededRandom } from "./create-seeded-random";
import { smoothstep } from "./smoothstep";
import { TOY_LIMITS } from "./toy-limits";

const SPREAD_SECONDS = 1.5;
const DRY_SECONDS = 70;
const RIPPLES = [2, 3, 4, 5, 7];

/** Return how far the puddle of `spill` reaches toward `angle` from its middle, in world units: it spreads at first and shrinks to nothing by `TOY_LIMITS.spillSeconds`, with a size, stretch and wobbly edge of its own picked from where it spilled, the same on every screen. */
export function getPuddleRadius(options: { spill: ToySpill; angle: number }) {
  const { spill, angle } = options;
  const random = createSeededRandom({
    seed: Math.round(spill.x * 10) * 7919 + Math.round(spill.y * 10),
  });
  const scale = 0.75 + random() * 0.5;
  const stretch = 1 + random() * 0.6;
  const along = random() * Math.PI;
  const wobble = RIPPLES.reduce(
    (sum, waves) =>
      sum + (0.03 + random() * 0.09) * Math.sin(angle * waves + random() * 6.3),
    1
  );
  const size =
    smoothstep(0, SPREAD_SECONDS, spill.seconds) *
    (1 -
      smoothstep(
        TOY_LIMITS.spillSeconds - DRY_SECONDS,
        TOY_LIMITS.spillSeconds,
        spill.seconds
      ));
  const turned = angle - along;
  const long = Math.sqrt(stretch);
  const short = 1 / long;
  const reach =
    (long * short) /
    Math.hypot(short * Math.cos(turned), long * Math.sin(turned));
  return TOY_LIMITS.puddleRadius * scale * size * wobble * reach;
}
