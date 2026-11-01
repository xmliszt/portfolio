import { clamp } from "./clamp";
import { getToyGap } from "./get-toy-gap";
import { isToyUsedUp } from "./is-toy-used-up";
import type { SimToy, World } from "./sim-types";
import { TOY_ITEMS, type ToyItemId } from "./toy-items";

const EDGE = 60;
const PLACE_GAP = 4;
const SEARCH_STEP = 10;
const SEARCH_REACH = 240;
const SEARCH_ANGLES = 24;

/** Put the toy `itemId` into `world` at `x`, `y`, kept inside the edges and moved to the nearest spot clear of the other toys: a full yarn ball, or a standing toilet roll. Return `true` when placed and `false`, leaving `world` unchanged, when that toy is already in the room or no clear spot is within `SEARCH_REACH`. */
export function placeToy(options: {
  world: World;
  itemId: ToyItemId;
  x: number;
  y: number;
}) {
  const { world, itemId } = options;
  const item = TOY_ITEMS.find((candidate) => candidate.id === itemId);
  if (item === undefined || world.toys.some((toy) => toy.id === itemId))
    return false;
  const place = {
    id: item.id,
    x: clamp(options.x, EDGE, world.width - EDGE),
    y: clamp(options.y, EDGE, world.height - EDGE),
    h: 0,
    angle: 0,
    spin: 0,
    vx: 0,
    vy: 0,
    vh: 0,
  };
  const toy: SimToy =
    item.kind === "yarn"
      ? { ...place, kind: "yarn", left: 1, fade: 0 }
      : { ...place, kind: "roll", isStanding: true, unrolled: 0, fade: 0 };
  const others = world.toys.filter((other) => !isToyUsedUp(other));
  const spots = [
    { x: toy.x, y: toy.y },
    ...Array.from(
      { length: SEARCH_REACH / SEARCH_STEP },
      (_, ring) => (ring + 1) * SEARCH_STEP
    ).flatMap((reach) =>
      Array.from({ length: SEARCH_ANGLES }, (_, step) => {
        const angle = (step / SEARCH_ANGLES) * Math.PI * 2;
        return {
          x: clamp(toy.x + Math.cos(angle) * reach, EDGE, world.width - EDGE),
          y: clamp(toy.y + Math.sin(angle) * reach, EDGE, world.height - EDGE),
        };
      })
    ),
  ];
  const free = spots.find((spot) =>
    others.every(
      (other) => getToyGap({ a: { ...toy, ...spot }, b: other }) >= PLACE_GAP
    )
  );
  if (free === undefined) return false;
  toy.x = free.x;
  toy.y = free.y;
  world.toys = [...world.toys, toy];
  world.trails[item.id] = [];
  return true;
}
