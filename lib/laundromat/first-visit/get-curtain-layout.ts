import type { BedroomConfig } from "./bedroom-config";

const CASING = 0.16;
const SILL_DROP = 0.32;

/** Return where the bedroom curtain hangs: the window `opening`, the wall face `wallX`, the rod plane `rodX`, the fabric's `top` and `bottom`, the leading ring's distance from the stacked ring when `openLeader` and `closedLeader`, and the ring gap range `minGap`–`maxGap`. */
export function getCurtainLayout(options: {
  window: BedroomConfig["window"];
  curtain: BedroomConfig["curtain"];
}) {
  const { position, size } = options.window;
  const { curtain } = options;
  const opening = {
    near: position.y + CASING,
    far: position.y + size.d - CASING,
    bottom: position.z + CASING,
    top: position.z + size.h - CASING,
  };
  const openingWidth = opening.far - opening.near;
  const openLeader = curtain.stackOutset + curtain.openReach;
  const closedLeader =
    curtain.stackOutset + openingWidth / 2 + curtain.closedOverlap;
  const gaps = curtain.rings - 1;
  return {
    opening,
    openingWidth,
    wallX: size.w,
    rodX: size.w + curtain.sillClearance,
    top: opening.top + curtain.rodRise,
    bottom: opening.top - (size.h - SILL_DROP + curtain.drop),
    openLeader,
    closedLeader,
    minGap: openLeader / gaps,
    maxGap: closedLeader / gaps,
  };
}
