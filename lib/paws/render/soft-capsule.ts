import type { DrawContext } from "./render-types";

/** Stacked translucent strokes, `[extra radius per unit of blur, alpha]`, that stand in for a blurred edge. */
export const SOFT_PASSES = [
  [1.5, 0.07],
  [1.1, 0.09],
  [0.75, 0.13],
  [0.45, 0.2],
  [0.15, 0.32],
  [-0.2, 1],
] as const;

const SHARP_BELOW_PX = 0.7;

/** Draw a round-capped capsule from `a` to `b` with radius `r`, its edge softened over `blur` world units. */
export function softCapsule(options: {
  draw: DrawContext;
  ax: number;
  ay: number;
  bx: number;
  by: number;
  r: number;
  blur: number;
  color: string;
  alpha?: number;
}) {
  const { draw, r, blur } = options;
  const { g, unitPx } = draw;
  const alpha = options.alpha ?? 1;
  const minWidth = 0.6 / unitPx;
  g.strokeStyle = options.color;
  g.lineCap = "round";
  const stroke = (width: number, passAlpha: number) => {
    g.lineWidth = Math.max(minWidth, width);
    g.globalAlpha = alpha * passAlpha;
    g.beginPath();
    g.moveTo(options.ax, options.ay);
    g.lineTo(options.bx + 0.01, options.by);
    g.stroke();
  };
  if (blur * unitPx < SHARP_BELOW_PX) stroke(2 * r, 1);
  else
    for (const [extra, passAlpha] of SOFT_PASSES)
      stroke(2 * r + 2 * extra * blur, passAlpha);
  g.globalAlpha = 1;
}
