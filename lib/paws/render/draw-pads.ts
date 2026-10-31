import { blurOf } from "./blur-of";
import { TOE_BEANS } from "./paw-pad-shapes";
import type { AnyContext, DrawContext } from "./render-types";

const traceMainPad = (g: AnyContext) => {
  g.beginPath();
  g.moveTo(2.4, 0);
  g.bezierCurveTo(3.4, -2.2, 2.6, -4.6, 0.4, -5.6);
  g.bezierCurveTo(-2.6, -7.2, -6.2, -9.2, -8.2, -7.6);
  g.bezierCurveTo(-9.8, -6.2, -9.6, -4, -9, -3.2);
  g.bezierCurveTo(-10.4, -1.8, -10.4, 1.8, -9, 3.2);
  g.bezierCurveTo(-9.6, 4, -9.8, 6.2, -8.2, 7.6);
  g.bezierCurveTo(-6.2, 9.2, -2.6, 7.2, 0.4, 5.6);
  g.bezierCurveTo(2.6, 4.6, 3.4, 2.2, 2.4, 0);
  g.closePath();
};

/** Draw the four toe beans and the main pad of one paw at `x, y` facing `angle`, softened by its height `h`. */
export function drawPads(options: {
  draw: DrawContext;
  x: number;
  y: number;
  angle: number;
  k: number;
  h: number;
  color: string;
  alpha: number;
}) {
  const { draw, k, alpha } = options;
  const { g } = draw;
  const blur = blurOf(options.h, k);
  const spread = options.h < 0.8 ? 1.1 : 1;
  const traceToes = () => {
    g.beginPath();
    for (const [x, y, rx, ry, rotation] of TOE_BEANS) {
      g.moveTo(x * spread + rx, y * spread);
      g.ellipse(x * spread, y * spread, rx, ry, rotation, 0, Math.PI * 2);
    }
  };
  g.save();
  g.translate(options.x, options.y);
  g.rotate(options.angle);
  g.scale(k, k);
  g.fillStyle = options.color;
  g.strokeStyle = options.color;
  if (blur * draw.unitPx > 0.7) {
    g.lineWidth = (blur * 1.6) / k;
    g.globalAlpha = alpha * 0.28;
    traceToes();
    g.stroke();
    traceMainPad(g);
    g.stroke();
  }
  g.globalAlpha = alpha / (1 + blur * 0.25);
  traceToes();
  g.fill();
  traceMainPad(g);
  g.fill();
  g.restore();
  g.globalAlpha = 1;
}
