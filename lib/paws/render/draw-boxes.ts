import type { DerivedCat } from "@/lib/paws/sim/derive-cat";
import { getBoxGap } from "@/lib/paws/sim/get-box-gap";
import { TOY_LIMITS } from "@/lib/paws/sim/toy-limits";
import type { ToySnapshot } from "@/lib/paws/wire-types";

import type { DrawContext } from "./render-types";

const KRAFT = { bottom: "#c29a6b", seam: "#9c7448", tape: "#d6b88c" };
const TAPE_HALF_WIDTH = 6;
const PRESS_RADIUS = 34;

/** Draw each box in `toys` as its flat bottom resting on the glass, over whatever cat is inside it: kraft card with the flaps' seam under a strip of tape, darker where one of `cats` inside presses it down. */
export function drawBoxes(options: {
  draw: DrawContext;
  toys: ToySnapshot[];
  cats: DerivedCat[];
}) {
  const { g, unitPx } = options.draw;
  const { halfWidth, halfDepth } = TOY_LIMITS.box;
  for (const toy of options.toys) {
    if (toy.kind !== "box") continue;
    g.save();
    g.translate(toy.x, toy.y);
    g.rotate(toy.angle);
    g.fillStyle = KRAFT.bottom;
    g.fillRect(-halfWidth, -halfDepth, halfWidth * 2, halfDepth * 2);
    g.fillStyle = KRAFT.tape;
    g.globalAlpha = 0.7;
    g.fillRect(
      -halfWidth,
      -TAPE_HALF_WIDTH,
      halfWidth * 2,
      TAPE_HALF_WIDTH * 2
    );
    g.globalAlpha = 1;
    g.save();
    g.beginPath();
    g.rect(-halfWidth, -halfDepth, halfWidth * 2, halfDepth * 2);
    g.clip();
    for (const cat of options.cats) {
      if (getBoxGap({ box: toy, x: cat.x, y: cat.y }) > 0) continue;
      const dx = cat.x - toy.x;
      const dy = cat.y - toy.y;
      const x = dx * Math.cos(toy.angle) + dy * Math.sin(toy.angle);
      const y = -dx * Math.sin(toy.angle) + dy * Math.cos(toy.angle);
      const r = PRESS_RADIUS * cat.k;
      const press = g.createRadialGradient(x, y, 0, x, y, r);
      press.addColorStop(0, KRAFT.seam);
      press.addColorStop(1, "transparent");
      g.globalAlpha = 0.45;
      g.fillStyle = press;
      g.fillRect(x - r, y - r, r * 2, r * 2);
    }
    g.restore();
    g.globalAlpha = 1;
    g.strokeStyle = KRAFT.seam;
    g.lineWidth = Math.max(0.7 / unitPx, 0.8);
    g.beginPath();
    g.moveTo(-halfWidth, 0);
    g.lineTo(halfWidth, 0);
    g.stroke();
    g.restore();
  }
}
