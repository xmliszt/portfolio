import { TOY_MARK_SECONDS, type ToyMarks } from "@/lib/paws/render/toy-marks";
import { isToyUsedUp } from "@/lib/paws/sim/is-toy-used-up";
import { TOY_LIMITS } from "@/lib/paws/sim/toy-limits";
import type { ToySnapshot, ToyTrail } from "@/lib/paws/wire-types";

import type { SceneResources } from "./create-scene-resources";
import { getTintedPrint } from "./get-tinted-print";
import { getYarnColors } from "./get-yarn-colors";
import { PAW_PRINT_BOX } from "./paw-print-box";
import type { DrawContext } from "./render-types";

const STRIP_INK = "#dedad0";
const WET_INK = "#7fa6d6";

function drawStrip(options: {
  draw: DrawContext;
  points: { x: number; y: number }[];
  alpha: number;
}) {
  const { g } = options.draw;
  const { points } = options;
  if (points.length < 2) return;
  g.lineCap = "butt";
  g.lineJoin = "round";
  for (const [width, alpha] of [
    [TOY_LIMITS.stripWidth + 3, 0.25],
    [TOY_LIMITS.stripWidth, 1],
  ] as const) {
    g.globalAlpha = alpha * options.alpha;
    g.strokeStyle = STRIP_INK;
    g.lineWidth = width;
    g.beginPath();
    points.forEach((point, index) =>
      index === 0 ? g.moveTo(point.x, point.y) : g.lineTo(point.x, point.y)
    );
    g.stroke();
  }
  g.globalAlpha = 1;
  g.lineCap = "round";
}

function drawThread(options: {
  draw: DrawContext;
  points: { x: number; y: number }[];
  color: string;
}) {
  const { g, unitPx } = options.draw;
  const { points } = options;
  if (points.length < 2) return;
  g.strokeStyle = options.color;
  g.lineWidth = Math.max(1.4 / unitPx, 1.2);
  g.lineCap = "round";
  g.lineJoin = "round";
  g.beginPath();
  g.moveTo(points[0].x, points[0].y);
  points.slice(1, -1).forEach((point, index) => {
    const next = points[index + 2];
    g.quadraticCurveTo(
      point.x,
      point.y,
      (point.x + next.x) / 2,
      (point.y + next.y) / 2
    );
  });
  const end = points[points.length - 1];
  g.lineTo(end.x, end.y);
  g.stroke();
}

/** Draw what the toys left on the glass at `time` seconds: each roll's paper strip and each yarn ball's thread from `trails`, run on to the toy while it still lays them and faded with it once it is used up, and the wet paw prints in `marks`. */
export function drawToyMarks(options: {
  draw: DrawContext;
  resources: SceneResources;
  marks: ToyMarks;
  toys: ToySnapshot[];
  trails: ToyTrail[];
  time: number;
}) {
  const { draw, resources, marks, toys, time } = options;
  const { g } = draw;
  for (const trail of options.trails) {
    const toy = toys.find((candidate) => candidate.id === trail.toyId);
    if (toy === undefined || (toy.kind !== "yarn" && toy.kind !== "roll"))
      continue;
    const isLaying =
      !isToyUsedUp(toy) && !(toy.kind === "roll" && toy.isStanding);
    const points = [
      ...trail.points.map(([x, y]) => ({ x, y })),
      ...(isLaying ? [{ x: toy.x, y: toy.y }] : []),
    ];
    g.globalAlpha = 1 - toy.fade;
    if (toy.kind === "roll") drawStrip({ draw, points, alpha: 1 - toy.fade });
    else drawThread({ draw, points, color: getYarnColors(toy.id).strand });
  }
  g.globalAlpha = 1;
  for (const print of marks.wetPrints) {
    const left = 1 - (time - print.bornAt) / TOY_MARK_SECONDS.wetPrint;
    if (left <= 0) continue;
    g.save();
    g.translate(print.x, print.y);
    g.rotate(print.angle);
    g.globalAlpha = 0.35 * left;
    g.drawImage(
      getTintedPrint({ resources, color: WET_INK, variant: 0 }),
      PAW_PRINT_BOX.x0,
      PAW_PRINT_BOX.y0,
      PAW_PRINT_BOX.width,
      PAW_PRINT_BOX.height
    );
    g.restore();
  }
  g.globalAlpha = 1;
}
