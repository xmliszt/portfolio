/** Sizes of the flying car toy set, in iso units from the set's `position`: `x` across the base, `y` along it, `z` up. The ramp is half an ellipse from its foot to its top, `rise` high and `reach` deep, then a straight lip. */
export const TOY_SET = {
  base: { height: 0.05 },
  track: { x: 0.4, halfWidth: 0.17, thickness: 0.04 },
  carStartY: 2.8,
  ramp: { footY: 1.2, rise: 1.7, reach: 0.6, lipLength: 0.35 },
  tower: { fromY: 0.2, toY: 0.5, fromX: 0.24, toX: 0.56, height: 1.92 },
  gantry: { toY: 1.6, depth: 0.08 },
} as const;
