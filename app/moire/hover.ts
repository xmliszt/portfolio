/*
  One pick-up gesture for the whole page: thumbnails, connection ends and the
  link out all lift the same way.

  Transform is Motion's rather than CSS's. Anything Motion already animates —
  every entrance on this page — owns its element's inline `transform`, so a
  `hover:-translate-y-*` class on the same element is silently overwritten and
  the lift appears to happen instantly or not at all. Driving hover through
  `whileHover` on the element Motion owns keeps one writer per property.

  Shadow stays in CSS: box-shadow needs a different colour per theme, which is
  a token's job, not a keyframe's.
*/
export const HOVER = {
  rest: { y: 0, scale: 1 },
  lift: { y: -6, scale: 1.03 },
  press: { y: -2, scale: 0.99 },
  spring: { type: "spring" as const, stiffness: 400, damping: 26 },
};
