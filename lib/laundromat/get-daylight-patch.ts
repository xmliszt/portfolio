import type { TimeOfDay } from "./get-time-of-day";

const LOW_SUN_STRETCH = 0.8;
const MAX_SLANT = 0.9;

/** Return the floor corners (iso `x`, `y`) of the sunlight cast through a left-wall window spanning `fromY`–`toY`, wall edge first, longer when `sun` is low and slanted by how far it has crossed the sky. */
export function getDaylightPatch(options: {
  wallX: number;
  fromY: number;
  toY: number;
  reach: number;
  sun: TimeOfDay["sun"];
}) {
  const { wallX, fromY, toY } = options;
  const elevation = options.sun?.elevation ?? 0;
  const progress = options.sun?.progress ?? 0.5;
  const farX = wallX + options.reach * (1 + (1 - elevation) * LOW_SUN_STRETCH);
  const slant = (progress - 0.5) * 2 * MAX_SLANT;
  return [
    { x: wallX, y: fromY },
    { x: wallX, y: toY },
    { x: farX, y: toY + slant },
    { x: farX, y: fromY + slant },
  ];
}
