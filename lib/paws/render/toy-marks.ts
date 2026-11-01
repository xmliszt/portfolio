/** How long each mark lasts, in seconds. */
export const TOY_MARK_SECONDS = {
  wetPrint: 20,
  ripple: 1.4,
} as const;

export type MarkPoint = { x: number; y: number; bornAt: number };

/** What the puddles left on one screen: wet paw prints on the glass and ripples in the water. */
export type ToyMarks = {
  wetPrints: (MarkPoint & { angle: number })[];
  ripples: MarkPoint[];
};
