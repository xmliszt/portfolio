import type { CatActivity, CatSnapshot, LegSnapshot } from "@/lib/paws/wire-types";

import type { SimCat, SimLeg, SimState } from "./sim-types";
import { wrapAngle } from "./wrap-angle";

const toActivity = (state: SimState): CatActivity => {
  switch (state) {
    case "offstage":
    case "flee":
      return "leave";
    case "enter":
    case "approach":
    case "pause":
    case "settle":
    case "sit":
    case "sleep":
    case "sniff":
    case "paw":
    case "greet":
    case "chase":
    case "chased":
    case "bat":
    case "leave":
      return state;
    default: {
      const unknown: never = state;
      return unknown;
    }
  }
};

const toLegSnapshot = (leg: SimLeg): LegSnapshot => ({
  x: leg.x,
  y: leg.y,
  h: leg.h,
});

/** Return what every screen needs to draw `cat` now. */
export function toCatSnapshot(cat: SimCat): CatSnapshot {
  return {
    userId: cat.userId,
    x: cat.x,
    y: cat.y,
    heading: wrapAngle(cat.heading),
    speed: cat.speed,
    bend: cat.bend,
    pose: { ...cat.weights },
    yaw: cat.yaw,
    sniff: cat.sniff,
    legs: [
      toLegSnapshot(cat.legs[0]),
      toLegSnapshot(cat.legs[1]),
      toLegSnapshot(cat.legs[2]),
      toLegSnapshot(cat.legs[3]),
    ],
    activity: toActivity(cat.state),
  };
}
