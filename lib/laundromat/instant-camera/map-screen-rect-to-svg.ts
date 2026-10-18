import type { ViewfinderFrame } from "./viewfinder-frame";

/** Return `rect`, given in screen px, in the user units of an SVG whose `viewBox` is drawn into `svgBox` on screen with uniform scale. */
export function mapScreenRectToSvg(options: {
  rect: ViewfinderFrame;
  svgBox: { left: number; top: number; width: number; height: number };
  viewBox: { x: number; y: number; width: number; height: number };
}): ViewfinderFrame {
  const { rect, svgBox, viewBox } = options;
  const scaleX = viewBox.width / svgBox.width;
  const scaleY = viewBox.height / svgBox.height;
  return {
    x: viewBox.x + (rect.x - svgBox.left) * scaleX,
    y: viewBox.y + (rect.y - svgBox.top) * scaleY,
    width: rect.width * scaleX,
    height: rect.height * scaleY,
  };
}
