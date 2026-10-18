import { TOY_TRACK_SECTIONS } from "./toy-track-sections";

const TOP_SPEED = 3;
const LAUNCH_MS = ((2 * TOY_TRACK_SECTIONS.floor) / TOP_SPEED) * 1000;
const CLIMB_MS =
  ((TOY_TRACK_SECTIONS.lip - TOY_TRACK_SECTIONS.floor) / TOP_SPEED) * 1000;
const COAST_MS = 600;
const STEADY_MS = 300;
const DESCEND_MS = 1100;
const SETTLE_MS = 350;
const HOP_MS = 450;
const SPIN_MS = 750;
const DROP_MS = 650;
const REST_MS = 250;

/** The toy car's run, phase by phase: speeds in iso units per second, heights in iso units, durations in ms. */
export const TOY_FLIGHT = {
  topSpeed: TOP_SPEED,
  launchMs: LAUNCH_MS,
  climbMs: CLIMB_MS,
  coastMs: COAST_MS,
  steadyMs: STEADY_MS,
  descendMs: DESCEND_MS,
  settleMs: SETTLE_MS,
  hopMs: HOP_MS,
  spinMs: SPIN_MS,
  dropMs: DROP_MS,
  restMs: REST_MS,
  hopHeight: 0.35,
  coastRise: 0.045,
  steadyBob: 0.012,
  settleDip: 0.008,
  totalMs:
    LAUNCH_MS +
    CLIMB_MS +
    COAST_MS +
    STEADY_MS +
    DESCEND_MS +
    SETTLE_MS +
    HOP_MS +
    SPIN_MS +
    DROP_MS +
    REST_MS,
} as const;
