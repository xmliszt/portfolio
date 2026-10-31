import type { DerivedCat } from "@/lib/paws/sim/derive-cat";

import type { DrawContext } from "./render-types";

const WHISKER_INK = "#968ca8";
export const WHISKER_FADE_HEIGHT = 22;

/** Draw `cat`'s whiskers, fading out as its head rises toward `WHISKER_FADE_HEIGHT` above the glass. */
export function drawWhiskers(options: { draw: DrawContext; cat: DerivedCat }) {
  const { draw, cat } = options;
  const { g } = draw;
  const k = cat.k;
  const fade = 1 - cat.headH / WHISKER_FADE_HEIGHT;
  const dir = cat.headDir;
  const cos = Math.cos(dir);
  const sin = Math.sin(dir);
  const muzzleX = cat.head[0] + cos * 20 * k;
  const muzzleY = cat.head[1] + sin * 20 * k;
  g.lineCap = "round";
  g.strokeStyle = WHISKER_INK;
  g.lineWidth = 0.8 / draw.unitPx;
  g.globalAlpha = 0.65 * fade;
  for (const side of [-1, 1]) {
    const startX = muzzleX - sin * side * 7 * k;
    const startY = muzzleY + cos * side * 7 * k;
    for (let j = 0; j < 3; j++) {
      const angle = dir + side * (0.75 + j * 0.28);
      const length = (44 - j * 5) * k;
      g.beginPath();
      g.moveTo(
        startX + Math.cos(angle) * length * 0.4,
        startY + Math.sin(angle) * length * 0.4
      );
      g.quadraticCurveTo(
        startX + Math.cos(angle - side * 0.2) * length * 0.75,
        startY + Math.sin(angle - side * 0.2) * length * 0.75,
        startX + Math.cos(angle) * length,
        startY + Math.sin(angle) * length
      );
      g.stroke();
    }
  }
  g.globalAlpha = 1;
}
