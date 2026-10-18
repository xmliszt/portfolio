import type { ViewfinderOrientation } from "./viewfinder-frame";
import { VIEWFINDER_RATIO } from "./viewfinder-frame";

/** Return the polaroid's photo size, side border, note font size, note margin paddings and bottom margin, in px, for a photo whose long edge is `longPx`; the bottom margin fits two note lines and the stamp row. */
export function getPolaroidMetrics(options: {
  orientation: ViewfinderOrientation;
  longPx: number;
}) {
  const { longPx } = options;
  const ratio = VIEWFINDER_RATIO[options.orientation];
  const photoWidth = ratio < 1 ? longPx * ratio : longPx;
  const photoHeight = ratio < 1 ? longPx : longPx / ratio;
  const border = Math.round(longPx * 0.055);
  const notePx = Math.round(longPx * 0.062);
  const stampPx = Math.max(9, Math.round(longPx * 0.022));
  const noteTop = Math.round(border * 0.9);
  const stampBottom = Math.round(border * 0.7);
  const bottom = Math.round(
    noteTop + notePx * 1.05 * 2 + border * 0.4 + stampPx * 1.4 + stampBottom
  );
  return {
    photoWidth,
    photoHeight,
    border,
    notePx,
    stampPx,
    noteTop,
    stampBottom,
    bottom,
    cardWidth: photoWidth + border * 2,
    cardHeight: border + photoHeight + bottom,
  };
}
