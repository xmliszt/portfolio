import { FINGERTIP_SHAPE } from "./fingertip-shape";
import type { DrawContext } from "./render-types";
import { softCapsule } from "./soft-capsule";

const SKIN = "#f3b9a3";
const SKIN_PRESSED = "#f1ad96";

/** Draw the soft oval of a fingertip at `x, y`, blurrier the higher `height` it hovers under the glass and slightly wider as it presses. */
export function drawFingertip(options: {
  draw: DrawContext;
  x: number;
  y: number;
  height: number;
  alpha: number;
  press: number;
}) {
  const { draw } = options;
  const { g } = draw;
  g.save();
  g.translate(options.x, options.y);
  g.rotate(FINGERTIP_SHAPE.angle);
  g.scale(1, FINGERTIP_SHAPE.ry / FINGERTIP_SHAPE.rx);
  softCapsule({
    draw,
    ax: 0,
    ay: 0,
    bx: 0,
    by: 0,
    r: FINGERTIP_SHAPE.rx * (1 + 0.08 * options.press),
    blur: 0.6 + options.height * 0.5,
    color: options.press > 0.3 ? SKIN_PRESSED : SKIN,
    alpha: options.alpha,
  });
  g.restore();
}
