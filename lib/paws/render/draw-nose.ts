import { blurOf } from "./blur-of";
import type { AnyContext } from "./render-types";

/** Draw a cat's nose leather at `x, y` pointing along `angle`, fainter the higher `h` it is above the glass. */
export function drawNose(options: {
  g: AnyContext;
  x: number;
  y: number;
  angle: number;
  k: number;
  h: number;
  color: string;
  alpha: number;
}) {
  const { g, k } = options;
  const blur = blurOf(options.h, k);
  g.save();
  g.translate(options.x, options.y);
  g.rotate(options.angle);
  g.scale(k, k);
  g.beginPath();
  g.moveTo(3.4, 0);
  g.quadraticCurveTo(3, -1.6, -1.6, -4.6);
  g.quadraticCurveTo(-3.6, -5.4, -3.6, -2.6);
  g.lineTo(-3.6, 2.6);
  g.quadraticCurveTo(-3.6, 5.4, -1.6, 4.6);
  g.quadraticCurveTo(3, 1.6, 3.4, 0);
  g.closePath();
  g.fillStyle = options.color;
  g.globalAlpha = options.alpha / (1 + blur * 0.3);
  g.fill();
  g.restore();
  g.globalAlpha = 1;
}
