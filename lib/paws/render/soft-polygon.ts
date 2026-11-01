import type { DrawContext } from "./render-types";
import { SOFT_PASSES } from "./soft-capsule";

/** Fill the straight-edged shape through `corners` in `color` at `alpha`, its edge softened over `blur` world units by fainter, wider strokes underneath. */
export function softPolygon(options: {
  draw: DrawContext;
  corners: { x: number; y: number }[];
  blur: number;
  color: string;
  alpha?: number;
}) {
  const { g, unitPx } = options.draw;
  const alpha = options.alpha ?? 1;
  g.fillStyle = options.color;
  g.strokeStyle = options.color;
  g.lineJoin = "round";
  g.beginPath();
  for (const corner of options.corners) g.lineTo(corner.x, corner.y);
  g.closePath();
  if (options.blur * unitPx >= 0.7) {
    for (const [extra, passAlpha] of SOFT_PASSES) {
      if (extra <= 0) continue;
      g.lineWidth = 2 * extra * options.blur;
      g.globalAlpha = alpha * passAlpha;
      g.stroke();
    }
  }
  g.globalAlpha = alpha;
  g.fill();
  g.globalAlpha = 1;
}
