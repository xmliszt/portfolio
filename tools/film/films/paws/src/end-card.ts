import { RISO } from "@/lib/paws/riso-inks";

import { mix, spring, SPRINGS } from "../../../engine/src/motion";
import { COPY } from "./copy";
import { MONO, riso, SERIF } from "./type";
import { type Box, paperFill, type Ui } from "./ui";

const clamp = (x: number) => Math.min(1, Math.max(0, x));

/** Draw the end card `u` seconds after it starts: it slides in, the paw stamps, the title rises and the address prints. */
export function drawEndCard(options: { ui: Ui; W: number; H: number; u: number; grain: CanvasPattern | undefined; pawIcon: HTMLImageElement }) {
  const { ui, W, H, u } = options;
  const g = ui.g;
  if (u < 0) return;
  const PORTRAIT = H > W;
  // At 3:4 the card stays short so the room below it, and the cat leaving, stay in frame.
  const SHORT = PORTRAIT && H / W < 1.5;
  const UNIT = Math.min(W, H) / 1080;
  const cardW = PORTRAIT ? W - 120 * UNIT : 900 * UNIT;
  const cardH = SHORT ? 780 * UNIT : PORTRAIT ? 1100 * UNIT : 780 * UNIT;
  const slide = spring(u, { omega: 9, zeta: 0.82 });
  const x0 = PORTRAIT ? (W - cardW) / 2 : 100 * UNIT;
  const y0 = SHORT ? 80 * UNIT : PORTRAIT ? 170 * UNIT : (H - cardH) / 2;
  const x = PORTRAIT ? x0 : mix(-cardW - 60 * UNIT, x0, slide);
  const y = PORTRAIT ? mix(-cardH - 60 * UNIT, y0, slide) : y0;
  const box: Box = { x, y, w: cardW, h: cardH };
  g.save();
  g.fillStyle = RISO.yellow;
  g.globalCompositeOperation = "multiply";
  g.fillRect(x + 12 * UNIT, y + 12 * UNIT, cardW, cardH);
  g.globalCompositeOperation = "source-over";
  paperFill(ui, box, options.grain);
  g.lineWidth = 3 * UNIT;
  g.strokeStyle = RISO.ink;
  g.strokeRect(x + 1.5 * UNIT, y + 1.5 * UNIT, cardW - 3 * UNIT, cardH - 3 * UNIT);
  const pad = (PORTRAIT ? 80 : 76) * UNIT;
  const stamp = spring(u - 0.5, { omega: 22, zeta: 0.55 });
  if (stamp > 0 && options.pawIcon.complete) {
    const base = 132 * UNIT;
    const size = base * mix(1.3, 1, stamp);
    g.save();
    g.globalAlpha = Math.min(1, stamp * 2);
    g.drawImage(options.pawIcon, x + pad - (size - base) / 2, y + pad - (size - base) / 2, size, size);
    g.restore();
  }
  const titlePx = (PORTRAIT ? 118 : 104) * UNIT;
  const titleTop = y + pad + 132 * UNIT + (SHORT ? 130 : PORTRAIT ? 190 : 150) * UNIT;
  g.font = `${titlePx}px ${SERIF}`;
  g.textBaseline = "alphabetic";
  COPY.film.title.forEach((line, i) => {
    const enter = spring(u - 0.75 - i * 0.12, SPRINGS.heavy);
    if (enter < 0.001) return;
    const ly = titleTop + i * titlePx * 1.02;
    g.save();
    g.beginPath();
    g.rect(x + pad - 10 * UNIT, ly - titlePx, cardW - pad + 10 * UNIT, titlePx * 1.2);
    g.clip();
    riso({ g, text: line, x: x + pad, y: ly + (1 - enter) * titlePx * 1.6, offset: 4 * UNIT });
    g.restore();
  });
  g.font = `${(PORTRAIT ? 40 : 36) * UNIT}px ${MONO}`;
  g.fillStyle = RISO.inkSoft;
  g.globalAlpha = clamp((u - 1.3) / 0.3);
  g.fillText(COPY.film.subtitle, x + pad, titleTop + titlePx * 1.02 + 70 * UNIT + (1 - spring(u - 1.3, SPRINGS.heavy)) * 20 * UNIT);
  g.globalAlpha = clamp((u - 1.8) / 0.3);
  g.font = `500 ${(PORTRAIT ? 46 : 42) * UNIT}px ${MONO}`;
  g.fillStyle = RISO.ink;
  g.fillText("paws.garden", x + pad, y + cardH - pad);
  g.font = `${(PORTRAIT ? 30 : 27) * UNIT}px ${MONO}`;
  g.fillStyle = RISO.inkSoft;
  g.fillText(COPY.film.facts, x + pad, y + cardH - pad - (PORTRAIT ? 72 : 64) * UNIT);
  g.restore();
}
