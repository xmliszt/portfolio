import { FINGERTIP_SHAPE } from "./fingertip-shape";
import type { FingerprintStyle } from "./get-fingerprint-style";
import type { DrawContext } from "./render-types";
import { softCapsule } from "./soft-capsule";

/** Draw the soft oval of a fingertip in `style`'s skin, angle and size at `x, y`, blurrier the higher `height` it hovers under the glass and slightly wider as it presses. */
export function drawFingertip(options: {
  draw: DrawContext;
  x: number;
  y: number;
  height: number;
  alpha: number;
  press: number;
  style: FingerprintStyle;
}) {
  const { draw } = options;
  const { g } = draw;
  g.save();
  g.translate(options.x, options.y);
  g.rotate(options.style.angle);
  g.scale(1, FINGERTIP_SHAPE.ry / FINGERTIP_SHAPE.rx);
  softCapsule({
    draw,
    ax: 0,
    ay: 0,
    bx: 0,
    by: 0,
    r: FINGERTIP_SHAPE.rx * options.style.scale * (1 + 0.08 * options.press),
    blur: 0.6 + options.height * 0.5,
    color:
      options.press > 0.3
        ? options.style.skin.pressed
        : options.style.skin.base,
    alpha: options.alpha,
  });
  g.restore();
}
