export type LegSide = -1 | 1;

export type LegPlace = { front: boolean; side: LegSide };

/** The four legs in snapshot order: front left, front right, hind left, hind right (left is cat-local y < 0). */
export const LEG_LAYOUT = [
  { front: true, side: -1 },
  { front: true, side: 1 },
  { front: false, side: -1 },
  { front: false, side: 1 },
] as const satisfies readonly LegPlace[];
