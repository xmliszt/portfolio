import { TOY_MARK_SECONDS, type ToyMarks } from "@/lib/paws/render/toy-marks";
import type { DerivedCat } from "@/lib/paws/sim/derive-cat";
import { getPuddleRadius } from "@/lib/paws/sim/get-puddle-radius";
import type { ToySnapshot, ToySpill } from "@/lib/paws/wire-types";

import { drawCats } from "./draw-cats";
import { flattenCat } from "./flatten-cat";
import { getCoatPalette } from "./get-coat-palette";
import type { AnyContext, DrawContext } from "./render-types";

const WATER_INK = "#8fb3dc";
const RIPPLE_INK = "#2b3a63";
const CLEAR_HEIGHT_FACTOR = 0.1;
const EDGE_STEPS = 48;
const NEAR_PUDDLE = 400;

function tracePuddle(g: AnyContext, spill: ToySpill) {
  g.beginPath();
  for (let i = 0; i <= EDGE_STEPS; i++) {
    const angle = (i / EDGE_STEPS) * Math.PI * 2;
    const r = getPuddleRadius({ spill, angle });
    const x = spill.x + Math.cos(angle) * r;
    const y = spill.y + Math.sin(angle) * r;
    if (i === 0) g.moveTo(x, y);
    else g.lineTo(x, y);
  }
  g.closePath();
}

/** Draw each spilled bowl's puddle over what is already drawn: inside it the frost is gone, so the water tint shows, `drawPrintsOnGlass` and `drawAirborne` draw the prints and what is in the air again, those of `cats`, in the order given, that stand near it are drawn again nearly sharp, and `drawToysOnGlass` draws the toys over them again, with ripples where paws touched it, all kept inside the water's edge. */
export function drawPuddles(options: {
  draw: DrawContext;
  toys: ToySnapshot[];
  cats: DerivedCat[];
  marks: ToyMarks;
  time: number;
  drawPrintsOnGlass: () => void;
  drawAirborne: () => void;
  drawToysOnGlass: () => void;
}) {
  const { draw, toys, cats, marks, time } = options;
  const { g } = draw;
  for (const toy of toys) {
    if (toy.kind !== "bowl" || toy.spill === undefined) continue;
    const spill = toy.spill;
    g.save();
    tracePuddle(g, spill);
    g.clip();
    g.globalCompositeOperation = "destination-out";
    g.fillStyle = "#000";
    g.fill();
    g.globalCompositeOperation = "source-over";
    g.globalAlpha = 0.12;
    g.fillStyle = WATER_INK;
    g.fill();
    g.globalAlpha = 1;
    options.drawPrintsOnGlass();
    options.drawAirborne();
    const nearCats = cats.filter(
      (cat) => Math.hypot(cat.x - spill.x, cat.y - spill.y) < NEAR_PUDDLE
    );
    drawCats({
      draw,
      cats: nearCats.map((cat) => ({
        cat: flattenCat({ cat, factor: CLEAR_HEIGHT_FACTOR }),
        palette: getCoatPalette({ look: cat.look, userId: cat.userId }),
      })),
    });
    options.drawToysOnGlass();
    g.strokeStyle = RIPPLE_INK;
    g.lineWidth = 1.5;
    for (const ripple of marks.ripples) {
      const age = (time - ripple.bornAt) / TOY_MARK_SECONDS.ripple;
      g.globalAlpha = 0.2 * (1 - age);
      g.beginPath();
      g.arc(ripple.x, ripple.y, 8 + age * 46, 0, Math.PI * 2);
      g.stroke();
    }
    g.globalAlpha = 1;
    g.restore();
  }
}
