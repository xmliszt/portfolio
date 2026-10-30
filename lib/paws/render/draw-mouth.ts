import type { Vec4 } from "@/lib/paws/sim/cat-poses";

import type { AnyContext } from "./render-types";

/** Draw a cat's mouth seen from below: a short line back from `at` along `angle` that parts into two curves toward the chin. */
export function drawMouth(options: {
  g: AnyContext;
  at: Vec4;
  angle: number;
  k: number;
  lineWidth: number;
  color: string;
  alpha: number;
}) {
  const { g, k } = options;
  g.save();
  g.translate(options.at[0], options.at[1]);
  g.rotate(options.angle);
  g.scale(k, k);
  g.lineCap = "round";
  g.lineWidth = options.lineWidth / k;
  g.strokeStyle = options.color;
  g.globalAlpha = options.alpha;
  g.beginPath();
  g.moveTo(0, 0);
  g.lineTo(-3.5, 0);
  for (const side of [-1, 1]) {
    g.moveTo(-3.5, 0);
    g.quadraticCurveTo(-6.5, side * 1.2, -7.5, side * 4.5);
  }
  g.stroke();
  g.restore();
  g.globalAlpha = 1;
}
