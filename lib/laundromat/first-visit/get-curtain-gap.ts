import type { getCurtainLayout } from "./get-curtain-layout";

/** Return the stretch of glass (`near`–`far` along the wall) the two panels leave uncovered when the leading ring is `leader` from the stacked ring, and `uncovered`, the share of the glass width that stretch is. */
export function getCurtainGap(options: {
  leader: number;
  layout: ReturnType<typeof getCurtainLayout>;
  stackOutset: number;
}) {
  const { opening, openingWidth } = options.layout;
  const covered = Math.min(
    Math.max(options.leader - options.stackOutset, 0),
    openingWidth / 2
  );
  return {
    near: opening.near + covered,
    far: opening.far - covered,
    uncovered: 1 - (2 * covered) / openingWidth,
  };
}
