import { getYarnColors } from "@/lib/paws/render/get-yarn-colors";
import { getYarnStrands } from "@/lib/paws/render/get-yarn-strands";
import { mixHex } from "@/lib/paws/render/mix-hex";
import { RISO } from "@/lib/paws/riso-inks";
import { TOY_ITEMS, type ToyItemId } from "@/lib/paws/sim/toy-items";

import { type Box, strokeBox, type Ui } from "./ui";
import { MONO } from "./type";

/** Draw toy `itemId` as the tray icon draws it, `size` across, centred at `x, y`. */
export function drawToyIcon(g: CanvasRenderingContext2D, options: { itemId: ToyItemId; x: number; y: number; size: number }) {
  const s = options.size / 24;
  g.save();
  g.translate(options.x - 12 * s, options.y - 12 * s);
  g.scale(s, s);
  const item = TOY_ITEMS.find((candidate) => candidate.id === options.itemId);
  if (item?.kind === "roll") {
    const ring = (r: number, fill: string | undefined, stroke: string, width = 1) => {
      g.beginPath();
      g.arc(12, 12, r, 0, Math.PI * 2);
      if (fill) {
        g.fillStyle = fill;
        g.fill();
      }
      g.strokeStyle = stroke;
      g.lineWidth = width;
      g.stroke();
    };
    ring(10, "#e6e1d5", "#cdc8bc");
    ring(7, undefined, "#d6d1c4");
    ring(4, undefined, "#a8743f", 2);
    g.restore();
    return;
  }
  const colors = getYarnColors(options.itemId);
  const blurred = mixHex({ from: colors.body, to: colors.strand, amount: 0.4 });
  const lit = mixHex({ from: colors.body, to: "#ffffff", amount: 0.25 });
  g.beginPath();
  g.arc(12, 12, 10, 0, Math.PI * 2);
  g.fillStyle = blurred;
  g.fill();
  g.save();
  g.clip();
  g.lineCap = "round";
  g.lineJoin = "round";
  for (const strand of getYarnStrands(options.itemId)) {
    for (const [stroke, width] of [[colors.strand, 1.45], [colors.body, 0.85], [lit, 0.3]] as const) {
      g.beginPath();
      strand.forEach(([x, y], i) => (i === 0 ? g.moveTo(12 + x * 10, 12 + y * 10) : g.lineTo(12 + x * 10, 12 + y * 10)));
      g.strokeStyle = stroke;
      g.lineWidth = width;
      g.stroke();
    }
  }
  g.restore();
  const rim = g.createRadialGradient(12, 12, 5.1, 12, 12, 10.2);
  rim.addColorStop(0, `${blurred}00`);
  rim.addColorStop(1, blurred);
  g.beginPath();
  g.arc(12, 12, 10.2, 0, Math.PI * 2);
  g.fillStyle = rim;
  g.fill();
  g.restore();
}

/** Draw the room's toy tray with its bottom-right corner at `right, bottom`, as the app lays it out: toys in `unavailableIds` greyed, `heldId` lifted, and a name label over `hoverId`; return each toy's button box. */
export function drawTray(ui: Ui, options: { right: number; bottom: number; unavailableIds: ToyItemId[]; heldId?: ToyItemId; held?: number; hoverId?: ToyItemId; hover?: number; label: string; alpha: number }) {
  const { g, k } = ui;
  const button = 32 * k;
  const pad = 4 * k;
  const gap = 4 * k;
  const w = TOY_ITEMS.length * button + (TOY_ITEMS.length - 1) * gap + 2 * pad;
  const h = button + 2 * pad;
  const x0 = options.right - w;
  const y0 = options.bottom - h;
  const boxes: { [id: string]: Box } = {};
  if (options.alpha <= 0) return boxes;
  g.save();
  g.globalAlpha = options.alpha;
  g.fillStyle = RISO.paper;
  g.fillRect(x0, y0, w, h);
  strokeBox(ui, { x: x0, y: y0, w, h });
  TOY_ITEMS.forEach((item, i) => {
    const box = { x: x0 + pad + i * (button + gap), y: y0 + pad, w: button, h: button };
    boxes[item.id] = box;
    const isHeld = options.heldId === item.id;
    const lift = isHeld ? (options.held ?? 1) : 0;
    g.save();
    g.globalAlpha = options.alpha * (options.unavailableIds.includes(item.id) && !isHeld ? 0.3 : 1);
    drawToyIcon(g, { itemId: item.id, x: box.x + button / 2, y: box.y + button / 2 - 8 * k * lift, size: 24 * k * (1 + 0.25 * lift) });
    g.restore();
  });
  const hover = options.hover ?? 0;
  if (options.hoverId !== undefined && hover > 0.01) {
    const box = boxes[options.hoverId]!;
    g.font = `${12 * k}px ${MONO}`;
    const tw = g.measureText(options.label).width + 16 * k;
    const tx = box.x + box.w / 2 - tw / 2;
    const ty = box.y - 8 * k - 22 * k - (1 - hover) * 6 * k;
    g.globalAlpha = options.alpha * hover;
    g.fillStyle = RISO.paper;
    g.fillRect(tx, ty, tw, 22 * k);
    g.strokeStyle = RISO.ink;
    g.lineWidth = 1 * k;
    g.strokeRect(tx, ty, tw, 22 * k);
    g.fillStyle = RISO.ink;
    g.textBaseline = "middle";
    g.textAlign = "left";
    g.fillText(options.label, tx + 8 * k, ty + 11 * k);
  }
  g.restore();
  return boxes;
}
