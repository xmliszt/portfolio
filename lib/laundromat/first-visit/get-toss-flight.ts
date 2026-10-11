import type { ScreenPoint } from "@/lib/laundromat/project-iso-point";

import type { BedroomConfig } from "./bedroom-config";

export const PILE_SLOTS = [
  { x: -9, y: 3, rotateDeg: -12 },
  { x: 10, y: 4, rotateDeg: 10 },
  { x: -1, y: -3, rotateDeg: 4 },
  { x: 11, y: -6, rotateDeg: -8 },
  { x: -11, y: -8, rotateDeg: 14 },
  { x: 2, y: -13, rotateDeg: -4 },
];

const THROW_LIFT_PX = 60;
const THROW_LIFT_PER_PX = 0.18;
const DROP_LIFT_PX = 12;
const FLIGHT_BASE_MS = 480;
const FLIGHT_MS_PER_PX = 0.5;

/** Return the arc a crumpled garment flies from `from` into pile slot `slotIndex` of the basket whose mouth is at `mouth`: the offsets to land, the peak height, its duration and spin. A `drop` falls straight in. */
export function getTossFlight(options: {
  from: ScreenPoint;
  mouth: ScreenPoint;
  slotIndex: number;
  drop: boolean;
  motion: BedroomConfig["motion"];
}) {
  const { from, mouth, slotIndex, drop, motion } = options;
  const slot = PILE_SLOTS[Math.min(slotIndex, PILE_SLOTS.length - 1)];
  const dx = mouth.x + slot.x - from.x;
  const dy = mouth.y + slot.y - from.y;
  const distance = Math.hypot(dx, dy);
  const lift = drop
    ? DROP_LIFT_PX
    : THROW_LIFT_PX + distance * THROW_LIFT_PER_PX;
  const throwMs = Math.min(
    motion.flightMaxMs,
    Math.max(motion.flightMinMs, FLIGHT_BASE_MS + distance * FLIGHT_MS_PER_PX)
  );
  const spinDeg =
    (slotIndex % 2 === 1 ? 1 : -1) * (80 + ((slotIndex * 37) % 70));
  return {
    slot,
    dx,
    dy,
    peak: Math.min(0, dy) - lift,
    durationMs: Math.round(drop ? motion.dropMs : throwMs),
    spinDeg: drop ? spinDeg / 3 : spinDeg,
  };
}
