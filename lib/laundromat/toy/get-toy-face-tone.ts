import type { IsoPoint } from "@/lib/laundromat/scene-config";

const SIDE_TONES = ["wall", "shade-1", "shade-2", "face"] as const;

export type ToyFaceTone = "top" | (typeof SIDE_TONES)[number];

/** Return the room tone a face with unit `normal` paints in: `top` when it faces up more than sideways, otherwise one of four side tones from `wall` (+x) to `face` (+y). */
export function getToyFaceTone(normal: IsoPoint): ToyFaceTone {
  if (normal.z >= Math.max(normal.x, normal.y)) return "top";
  const towardX = Math.max(normal.x, 0);
  const towardY = Math.max(normal.y, 0);
  const ratio = towardX + towardY === 0 ? 1 : towardY / (towardX + towardY);
  return SIDE_TONES[Math.round(ratio * (SIDE_TONES.length - 1))];
}
