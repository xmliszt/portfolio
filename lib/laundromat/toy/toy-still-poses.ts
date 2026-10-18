import { TOY_FLIGHT } from "./toy-flight-timeline";

const POSES_MS = [
  TOY_FLIGHT.launchMs + TOY_FLIGHT.climbMs * 0.97,
  TOY_FLIGHT.launchMs +
    TOY_FLIGHT.climbMs +
    TOY_FLIGHT.coastMs +
    TOY_FLIGHT.steadyMs +
    TOY_FLIGHT.descendMs * 0.45,
  TOY_FLIGHT.totalMs,
];
const HOLD_MS = TOY_FLIGHT.totalMs / POSES_MS.length;

/** The held poses a reduced-motion run shows instead of the flight: the moments into the run they show, how long each holds, and when the last one, the parked car, appears. */
export const TOY_STILL_POSES = {
  posesMs: POSES_MS,
  holdMs: HOLD_MS,
  totalMs: HOLD_MS * (POSES_MS.length - 1),
} as const;
