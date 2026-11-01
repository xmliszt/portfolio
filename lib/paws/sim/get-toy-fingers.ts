import { getToyFingerId } from "./get-toy-finger-id";
import { isToyUsedUp } from "./is-toy-used-up";
import type { FingerInput, World } from "./sim-types";

/** Return a finger on each toy in `world` that is not used up, on its puddle once a bowl has spilled, pressed for every toy but the box. */
export function getToyFingers(world: World): FingerInput[] {
  return world.toys
    .filter((toy) => !isToyUsedUp(toy))
    .map((toy) => {
      const spot =
        toy.kind === "bowl" && toy.spill !== undefined ? toy.spill : toy;
      return {
        userId: getToyFingerId(toy.id),
        x: spot.x,
        y: spot.y,
        pressed: toy.kind !== "box",
      };
    });
}
