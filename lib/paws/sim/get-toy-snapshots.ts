import type { ToySnapshot } from "@/lib/paws/wire-types";

import type { World } from "./sim-types";

const round = (value: number) => Math.round(value * 10) / 10;

/** Return a snapshot of every toy in `world`, positions rounded to a tenth of a unit and shares to a thousandth. */
export function getToySnapshots(world: World): ToySnapshot[] {
  return world.toys.map((toy) => {
    const place = {
      id: toy.id,
      x: round(toy.x),
      y: round(toy.y),
      h: round(toy.h),
      angle: round(toy.angle * 100) / 100,
      spin: round(toy.spin * 100) / 100,
    };
    switch (toy.kind) {
      case "yarn":
        return {
          ...place,
          kind: "yarn",
          left: Math.round(toy.left * 1000) / 1000,
          fade: Math.round(toy.fade * 1000) / 1000,
        };
      case "box":
        return { ...place, kind: "box" };
      case "roll":
        return {
          ...place,
          kind: "roll",
          isStanding: toy.isStanding,
          unrolled: round(toy.unrolled),
          fade: Math.round(toy.fade * 1000) / 1000,
        };
      case "bowl":
        return {
          ...place,
          kind: "bowl",
          spill:
            toy.spill === undefined
              ? undefined
              : {
                  x: round(toy.spill.x),
                  y: round(toy.spill.y),
                  seconds: round(toy.spill.seconds),
                },
        };
      default: {
        const unknown: never = toy;
        return unknown;
      }
    }
  });
}
