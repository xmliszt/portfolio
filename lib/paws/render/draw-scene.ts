import type { ToyMarks } from "@/lib/paws/render/toy-marks";
import type { DerivedCat } from "@/lib/paws/sim/derive-cat";
import type { Sky } from "@/lib/paws/sky/sky-types";
import type { ToySnapshot, ToyTrail } from "@/lib/paws/wire-types";

import type { SceneResources } from "./create-scene-resources";
import { cutGrain } from "./cut-grain";
import { drawBoxes } from "./draw-boxes";
import { drawCat } from "./draw-cat";
import { drawFingers } from "./draw-fingers";
import { drawFireflies } from "./draw-fireflies";
import { drawPrints } from "./draw-prints";
import { drawPuddles } from "./draw-puddles";
import { drawToyMarks } from "./draw-toy-marks";
import { drawToys } from "./draw-toys";
import { getCoatPalette } from "./get-coat-palette";
import { liftCatOverBox } from "./lift-cat-over-box";
import { paintPaper } from "./paint-paper";
import type { SceneFinger, ScenePrint, WorldView } from "./render-types";

/** Draw the whole pane onto `g`, a `width` by `height` CSS pixel canvas at `dpr`: the inked paper, then prints, cats nearest the top first, and fingertips, all printed onto the paper with riso grain; with `toys`, their `trails` and `toyMarks`, cats raised where they climb over the box, the toys and what they left on the glass over the cats, since they lie between the cats and the viewer, and the puddles' clear water; with `sky`, also the night over everything. */
export function drawScene(options: {
  g: CanvasRenderingContext2D;
  width: number;
  height: number;
  dpr: number;
  view: WorldView;
  cats: DerivedCat[];
  prints: ScenePrint[];
  fingers: SceneFinger[];
  time: number;
  resources: SceneResources;
  sky?: Sky;
  toys?: ToySnapshot[];
  toyMarks?: ToyMarks;
  trails?: ToyTrail[];
}) {
  const { g, width, height, dpr, view, resources, time, sky, toyMarks } =
    options;
  const toys = options.toys ?? [];
  const paper = paintPaper({ resources, width, height, dpr, time, sky });
  const { layer } = resources;
  const deviceWidth = paper.width;
  const deviceHeight = paper.height;
  if (
    layer.canvas.width !== deviceWidth ||
    layer.canvas.height !== deviceHeight
  ) {
    layer.canvas.width = deviceWidth;
    layer.canvas.height = deviceHeight;
  }
  const ink = layer.g;
  ink.setTransform(1, 0, 0, 1, 0, 0);
  ink.globalCompositeOperation = "source-over";
  ink.globalAlpha = 1;
  ink.clearRect(0, 0, deviceWidth, deviceHeight);
  ink.setTransform(
    dpr * view.scale,
    0,
    0,
    dpr * view.scale,
    dpr * view.offsetX,
    dpr * view.offsetY
  );
  const draw = { g: ink, unitPx: view.scale };
  const seed = resources.paperSeed;
  function drawPrintsOnGlass() {
    drawPrints({ draw, resources, prints: options.prints, time });
  }
  function drawToysOnGlass() {
    if (toyMarks !== undefined)
      drawToyMarks({
        draw,
        resources,
        marks: toyMarks,
        toys,
        trails: options.trails ?? [],
        time,
      });
    drawToys({ draw, toys, isAirborne: false });
  }
  drawPrintsOnGlass();
  function drawAirborne() {
    drawToys({ draw, toys, isAirborne: true });
  }
  drawAirborne();
  const bodyHeight = (cat: DerivedCat) =>
    cat.spine.reduce((total, point) => total + point[3], 0) / cat.spine.length;
  const cats = toys.reduce(
    (lifted, box) =>
      box.kind === "box"
        ? lifted.map((cat) => liftCatOverBox({ cat, box }))
        : lifted,
    options.cats
  );
  const farthestFirst = cats.toSorted(
    (a, b) => bodyHeight(b) - bodyHeight(a) || (a.userId < b.userId ? -1 : 1)
  );
  for (const cat of farthestFirst) {
    drawCat({
      draw,
      cat,
      palette: getCoatPalette({ look: cat.look, userId: cat.userId }),
    });
  }
  drawToysOnGlass();
  if (toyMarks !== undefined)
    drawPuddles({
      draw,
      toys,
      cats: farthestFirst,
      marks: toyMarks,
      time,
      drawPrintsOnGlass,
      drawAirborne,
      drawToysOnGlass,
    });
  drawBoxes({ draw, toys, cats });
  drawFingers({ draw, resources, fingers: options.fingers, time });
  cutGrain({
    g: ink,
    grain: resources.grain,
    width,
    height,
    dpr,
    strength: 0.7,
  });

  g.save();
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalAlpha = 1;
  g.globalCompositeOperation = "source-over";
  g.drawImage(paper, 0, 0);
  g.globalCompositeOperation = "multiply";
  g.drawImage(layer.canvas, 0, 0);
  if (resources.night.isDark) g.drawImage(resources.night.canvas, 0, 0);
  if (sky?.season === "summer") {
    g.globalCompositeOperation = "screen";
    g.setTransform(
      dpr * view.scale,
      0,
      0,
      dpr * view.scale,
      dpr * view.offsetX,
      dpr * view.offsetY
    );
    drawFireflies({ g, time, seed, strength: sky.lamp });
  }
  g.restore();
}
