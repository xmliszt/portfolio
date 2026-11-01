import { getToyRadius } from "@/lib/paws/sim/get-toy-radius";
import { isToyUsedUp } from "@/lib/paws/sim/is-toy-used-up";
import { TOY_LIMITS } from "@/lib/paws/sim/toy-limits";
import type { ToySnapshot } from "@/lib/paws/wire-types";

import { blurOf } from "./blur-of";
import { getYarnColors } from "./get-yarn-colors";
import { getYarnStrands } from "./get-yarn-strands";
import { mixHex } from "./mix-hex";
import type { DrawContext } from "./render-types";
import { softCapsule } from "./soft-capsule";
import { softPolygon } from "./soft-polygon";

const AIRBORNE_HEIGHT = 2;
const YARN_FLUFF = 1.6;
const PAPER = { face: "#dedad0", ring: "#cdc8bc", core: "#a8743f" };
const STEEL = { side: "#b7bcc8", bottom: "#9aa0b0", base: "#3f4558" };

function disc(options: {
  draw: DrawContext;
  x: number;
  y: number;
  r: number;
  blur: number;
  color: string;
  alpha?: number;
}) {
  const { draw, x, y, r, blur, color, alpha } = options;
  softCapsule({ draw, ax: x, ay: y, bx: x, by: y, r, blur, color, alpha });
}

function ring(options: {
  draw: DrawContext;
  x: number;
  y: number;
  r: number;
  width: number;
  color: string;
  alpha?: number;
}) {
  const { g, unitPx } = options.draw;
  g.strokeStyle = options.color;
  g.globalAlpha = options.alpha ?? 1;
  g.lineWidth = Math.max(0.8 / unitPx, options.width);
  g.beginPath();
  g.arc(options.x, options.y, options.r, 0, Math.PI * 2);
  g.stroke();
  g.globalAlpha = 1;
}

function line(options: {
  draw: DrawContext;
  ax: number;
  ay: number;
  bx: number;
  by: number;
  color: string;
  alpha?: number;
}) {
  const { g, unitPx } = options.draw;
  g.strokeStyle = options.color;
  g.globalAlpha = options.alpha ?? 1;
  g.lineWidth = Math.max(0.8 / unitPx, 1.2);
  g.lineCap = "butt";
  g.beginPath();
  g.moveTo(options.ax, options.ay);
  g.lineTo(options.bx, options.by);
  g.stroke();
  g.globalAlpha = 1;
}

function drawYarn(draw: DrawContext, toy: ToySnapshot & { kind: "yarn" }) {
  const { g, unitPx } = draw;
  if (isToyUsedUp(toy)) return;
  const r = getToyRadius(toy);
  const colors = getYarnColors(toy.id);
  disc({
    draw,
    x: toy.x,
    y: toy.y,
    r,
    blur: blurOf(toy.h + r, 1) + YARN_FLUFF,
    color: mixHex({ from: colors.body, to: colors.strand, amount: 0.4 }),
  });
  const contact = Math.max(0, 1 - toy.h / 4);
  if (contact === 0) return;
  const lit = mixHex({ from: colors.body, to: "#ffffff", amount: 0.25 });
  const width = Math.max(0.8 / unitPx, r * 0.085);
  g.save();
  g.translate(toy.x, toy.y);
  g.rotate(toy.spin);
  g.lineCap = "round";
  g.lineJoin = "round";
  g.globalAlpha = contact;
  for (const strand of getYarnStrands(toy.id)) {
    g.beginPath();
    strand.forEach(([x, y], index) =>
      index === 0 ? g.moveTo(x * r, y * r) : g.lineTo(x * r, y * r)
    );
    for (const [color, share] of [
      [colors.strand, 1.7],
      [colors.body, 1],
      [lit, 0.35],
    ] as const) {
      g.strokeStyle = color;
      g.lineWidth = width * share;
      g.stroke();
    }
  }
  g.globalAlpha = 1;
  const rim = g.createRadialGradient(0, 0, r * 0.5, 0, 0, r * 1.02);
  const blurred = mixHex({ from: colors.body, to: colors.strand, amount: 0.4 });
  rim.addColorStop(0, `${blurred}00`);
  rim.addColorStop(1, blurred);
  g.fillStyle = rim;
  g.beginPath();
  g.arc(0, 0, r * 1.02, 0, Math.PI * 2);
  g.fill();
  g.restore();
}

function drawRoll(draw: DrawContext, toy: ToySnapshot & { kind: "roll" }) {
  const r = TOY_LIMITS.radius.roll;
  const alpha = 1 - toy.fade;
  const { halfLength, core } = TOY_LIMITS.roll;
  if (toy.isStanding) {
    disc({ draw, x: toy.x, y: toy.y, r, blur: 0.6, color: PAPER.face });
    for (let layer = core + 2; layer < r - 0.5; layer += 1.6)
      ring({
        draw,
        x: toy.x,
        y: toy.y,
        r: layer,
        width: 0.3,
        color: PAPER.ring,
        alpha: 0.6,
      });
    ring({
      draw,
      x: toy.x,
      y: toy.y,
      r: core + 0.6,
      width: 1.2,
      color: PAPER.core,
    });
    return;
  }
  const fullness = 1 - toy.unrolled / TOY_LIMITS.maxUnrolled;
  const radius = core + (r - core) * fullness;
  const along = { x: Math.cos(toy.angle), y: Math.sin(toy.angle) };
  const across = { x: -along.y, y: along.x };
  softPolygon({
    draw,
    corners: [
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1],
    ].map(([a, b]) => ({
      x: toy.x + along.x * halfLength * a + across.x * radius * b,
      y: toy.y + along.y * halfLength * a + across.y * radius * b,
    })),
    blur: blurOf(radius, 1),
    color: fullness < 0.05 ? PAPER.core : PAPER.face,
    alpha,
  });
  line({
    draw,
    ax: toy.x - along.x * halfLength,
    ay: toy.y - along.y * halfLength,
    bx: toy.x + along.x * halfLength,
    by: toy.y + along.y * halfLength,
    color: PAPER.ring,
    alpha,
  });
}

function drawBowl(draw: DrawContext, toy: ToySnapshot) {
  const { baseRadius, depth } = TOY_LIMITS.bowl;
  disc({
    draw,
    x: toy.x,
    y: toy.y,
    r: TOY_LIMITS.radius.bowl,
    blur: blurOf(depth, 1),
    color: STEEL.side,
    alpha: 0.85,
  });
  disc({
    draw,
    x: toy.x,
    y: toy.y,
    r: baseRadius,
    blur: 0.4,
    color: STEEL.bottom,
  });
  ring({
    draw,
    x: toy.x,
    y: toy.y,
    r: baseRadius,
    width: 1.4,
    color: STEEL.base,
    alpha: 0.85,
  });
}

/** Draw each toy in `toys` but the box as it looks from under the glass, only those off the glass when `isAirborne` is `true` and only those on it when `false`: what touches the glass sharp with its texture, the rest a soft mass of its colour that softens the higher it reaches. */
export function drawToys(options: {
  draw: DrawContext;
  toys: ToySnapshot[];
  isAirborne: boolean;
}) {
  for (const toy of options.toys) {
    if (toy.h > AIRBORNE_HEIGHT !== options.isAirborne) continue;
    switch (toy.kind) {
      case "yarn":
        drawYarn(options.draw, toy);
        break;
      case "roll":
        drawRoll(options.draw, toy);
        break;
      case "bowl":
        drawBowl(options.draw, toy);
        break;
      case "box":
        break;
      default: {
        const unknown: never = toy;
        return unknown;
      }
    }
  }
}
