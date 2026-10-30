import type { DerivedCat } from "@/lib/paws/sim/derive-cat";

import type { SceneResources } from "./create-scene-resources";
import { cutGrain } from "./cut-grain";
import { drawCat } from "./draw-cat";
import { drawFingers } from "./draw-fingers";
import { drawPrints } from "./draw-prints";
import { getCoatPalette } from "./get-coat-palette";
import { paintPaper } from "./paint-paper";
import type { SceneFinger, ScenePrint, WorldView } from "./render-types";

/** Draw the whole pane onto `g`, a `width` by `height` CSS pixel canvas at `dpr`: the inked paper, then prints, cats nearest the top first, and fingertips, all printed onto the paper with riso grain. */
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
}) {
  const { g, width, height, dpr, view, resources, time } = options;
  const paper = paintPaper({ resources, width, height, dpr });
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
  drawPrints({ draw, resources, prints: options.prints, time });
  for (const cat of options.cats.toSorted((a, b) => a.y - b.y)) {
    drawCat({
      draw,
      cat,
      palette: getCoatPalette({ look: cat.look, userId: cat.userId }),
    });
  }
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
  g.restore();
}
