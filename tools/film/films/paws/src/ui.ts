import { RISO } from "@/lib/paws/riso-inks";

import { MONO, SERIF } from "./type";

/** The app's own measurements, drawn `k` film pixels per CSS pixel. */
export type Ui = { g: CanvasRenderingContext2D; k: number };

export type Box = { x: number; y: number; w: number; h: number };

export const inside = (box: Box, point: { x: number; y: number }) =>
  point.x >= box.x && point.x <= box.x + box.w && point.y >= box.y && point.y <= box.y + box.h;

export const center = (box: Box) => ({ x: box.x + box.w / 2, y: box.y + box.h / 2 });

export function font(ui: Ui, options: { px: number; weight?: 400 | 500; family?: "mono" | "serif" }) {
  ui.g.font = `${options.weight ?? 400} ${options.px * ui.k}px ${options.family === "serif" ? SERIF : MONO}`;
}

export function strokeBox(ui: Ui, box: Box, color: string = RISO.ink) {
  const { g, k } = ui;
  g.strokeStyle = color;
  g.lineWidth = 1.5 * k;
  g.strokeRect(box.x + 0.75 * k, box.y + 0.75 * k, box.w - 1.5 * k, box.h - 1.5 * k);
}

/** Fill `box` with paper and the faint ink grain `FloatingCard` prints on its cards. */
export function paperFill(ui: Ui, box: Box, grain: CanvasPattern | undefined, color: string = RISO.paper) {
  const { g } = ui;
  g.fillStyle = color;
  g.fillRect(box.x, box.y, box.w, box.h);
  if (grain === undefined) return;
  g.save();
  g.globalAlpha = 0.14;
  g.fillStyle = grain;
  g.fillRect(box.x, box.y, box.w, box.h);
  g.restore();
}

/** Draw `RisoButton`: `primary` is yellow with a pink border printed 3 × 2 px off behind it; `pressed` sinks it. */
export function risoButton(ui: Ui, options: { box: Box; label: string; variant: "primary" | "quiet"; press?: number; icon?: (box: Box) => void }) {
  const { g, k } = ui;
  const press = options.press ?? 0;
  const box = { ...options.box, x: options.box.x + press * k, y: options.box.y + press * k };
  g.save();
  if (options.variant === "primary") {
    g.globalCompositeOperation = "multiply";
    strokeBox(ui, { ...options.box, x: options.box.x + 3 * k, y: options.box.y + 2 * k }, RISO.pink);
    g.globalCompositeOperation = "source-over";
    g.fillStyle = RISO.yellow;
  } else {
    g.fillStyle = RISO.paper;
  }
  g.fillRect(box.x, box.y, box.w, box.h);
  strokeBox(ui, box);
  font(ui, { px: 12, weight: options.variant === "primary" ? 500 : 400 });
  g.fillStyle = RISO.ink;
  g.textBaseline = "middle";
  g.textAlign = "center";
  const iconW = options.icon ? 16 * k : 0;
  g.fillText(options.label, box.x + box.w / 2 + iconW / 2, box.y + box.h / 2 + 0.5 * k);
  if (options.icon) {
    const textW = g.measureText(options.label).width;
    options.icon({ x: box.x + box.w / 2 - textW / 2 - iconW / 2 - 4 * k, y: box.y + box.h / 2 - 6 * k, w: 12 * k, h: 12 * k });
  }
  g.restore();
}

export function buttonWidth(ui: Ui, label: string, weight: 400 | 500, extra = 0) {
  font(ui, { px: 12, weight });
  return ui.g.measureText(label).width + 24 * ui.k + extra;
}

/** Draw `SwatchPicker` from its top-left corner and return each swatch's box. */
export function swatchPicker(ui: Ui, options: { x: number; y: number; w: number; legend: string; chosen: string; options: { value: string; label: string; fill: string | string[] }[]; value: string }) {
  const { g, k } = ui;
  font(ui, { px: 12 });
  g.textBaseline = "top";
  g.textAlign = "left";
  g.fillStyle = RISO.inkSoft;
  g.fillText(options.legend, options.x, options.y);
  const legendW = g.measureText(options.legend).width;
  g.fillStyle = RISO.ink;
  g.fillText(options.chosen, options.x + legendW + 8 * k, options.y);
  const size = 28 * k;
  const gap = 6 * k;
  const top = options.y + 20 * k;
  return options.options.map((option, i) => {
    const box = { x: options.x + i * (size + gap), y: top, w: size, h: size };
    const c = center(box);
    if (option.value === options.value) {
      g.strokeStyle = RISO.ink;
      g.lineWidth = 1.5 * k;
      g.beginPath();
      g.arc(c.x, c.y, size / 2 - 0.75 * k, 0, Math.PI * 2);
      g.stroke();
    }
    const r = 10 * k;
    g.save();
    g.beginPath();
    g.arc(c.x, c.y, r, 0, Math.PI * 2);
    g.clip();
    const fills = Array.isArray(option.fill) ? option.fill : [option.fill];
    fills.forEach((fill, j) => {
      g.fillStyle = fill;
      g.fillRect(c.x - r + (j * 2 * r) / fills.length, c.y - r, (2 * r) / fills.length, 2 * r);
    });
    g.strokeStyle = "rgba(43,58,99,0.25)";
    g.lineWidth = 3 * k;
    g.beginPath();
    g.arc(c.x, c.y, r, 0, Math.PI * 2);
    g.stroke();
    g.restore();
    return { value: option.value, box };
  });
}

/** Draw `SegmentedControl` from its top-left corner and return each option's box. */
export function segmented(ui: Ui, options: { x: number; y: number; w: number; legend: string; options: { value: string; label: string }[]; value: string; columns: number }) {
  const { g, k } = ui;
  font(ui, { px: 12 });
  g.textBaseline = "top";
  g.textAlign = "left";
  g.fillStyle = RISO.inkSoft;
  g.fillText(options.legend, options.x, options.y);
  const top = options.y + 18 * k;
  const rows = Math.ceil(options.options.length / options.columns);
  const cellH = 28 * k;
  const line = 1.5 * k;
  const gridH = rows * cellH + (rows + 1) * line;
  g.fillStyle = RISO.ink;
  g.fillRect(options.x, top, options.w, gridH);
  const cellW = (options.w - (options.columns + 1) * line) / options.columns;
  const leftover = options.options.length % options.columns;
  return options.options.map((option, i) => {
    const col = i % options.columns;
    const row = Math.floor(i / options.columns);
    const span = i === options.options.length - 1 && leftover > 0 ? options.columns - leftover + 1 : 1;
    const box = { x: options.x + line + col * (cellW + line), y: top + line + row * (cellH + line), w: cellW * span + line * (span - 1), h: cellH };
    const isChecked = option.value === options.value;
    g.fillStyle = isChecked ? RISO.ink : RISO.paper;
    g.fillRect(box.x, box.y, box.w, box.h);
    font(ui, { px: 12 });
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillStyle = isChecked ? RISO.paper : RISO.ink;
    g.fillText(option.label, box.x + box.w / 2, box.y + box.h / 2 + 0.5 * k);
    return { value: option.value, box };
  });
}

/** Draw the studio's tab row with an orange rule under `active`, and return each tab's box. */
export function tabs(ui: Ui, options: { x: number; y: number; labels: { value: string; label: string }[]; active: string }) {
  const { g, k } = ui;
  font(ui, { px: 12 });
  g.textBaseline = "middle";
  g.textAlign = "left";
  let x = options.x;
  return options.labels.map((tab) => {
    const w = g.measureText(tab.label).width;
    const box = { x, y: options.y, w, h: 20 * k };
    const isActive = tab.value === options.active;
    g.fillStyle = isActive ? RISO.ink : RISO.inkSoft;
    g.fillText(tab.label, x, options.y + 10 * k);
    if (isActive) {
      g.fillStyle = RISO.orange;
      g.fillRect(x, options.y + 19 * k, w, 1.5 * k);
    }
    x += w + 16 * k;
    return { value: tab.value, box };
  });
}

/** Draw the system arrow pointer with its tip at `x, y`, nudged down while `press` is above 0. */
export function pointer(ui: Ui, options: { x: number; y: number; press: number; alpha: number }) {
  const { g, k } = ui;
  if (options.alpha <= 0) return;
  const s = k * 1.15 * (1 - 0.1 * options.press);
  g.save();
  g.globalAlpha = options.alpha;
  g.translate(options.x, options.y);
  g.scale(s, s);
  g.beginPath();
  g.moveTo(0, 0);
  g.lineTo(0, 17);
  g.lineTo(4.2, 13.2);
  g.lineTo(7.2, 19.6);
  g.lineTo(9.8, 18.4);
  g.lineTo(6.9, 12.2);
  g.lineTo(12.2, 12.2);
  g.closePath();
  g.fillStyle = RISO.ink;
  g.strokeStyle = RISO.paper;
  g.lineWidth = 1.6;
  g.lineJoin = "round";
  g.stroke();
  g.fill();
  g.restore();
}

/** Draw `BubbleFrame` with `text` so its tail tip lands on `x, y`, popped to `scale` from the tail. */
export function bubble(ui: Ui, options: { x: number; y: number; text: string; accent: string; scale: number; reveal?: number }) {
  const { g, k } = ui;
  if (options.scale <= 0.01) return;
  font(ui, { px: 13 });
  const chars = [...options.text];
  const shown = chars.slice(0, Math.max(1, Math.round(chars.length * (options.reveal ?? 1)))).join("");
  const full = g.measureText(shown).width;
  const w = full + 16 * k + 3 * k;
  const h = 13 * 1.375 * k + 8 * k + 3 * k;
  const tail = 6 * k;
  g.save();
  g.translate(options.x, options.y);
  g.scale(options.scale, options.scale);
  g.translate(-w / 2, -h - tail);
  g.globalCompositeOperation = "multiply";
  strokeBox(ui, { x: 3 * k, y: 2 * k, w, h }, options.accent);
  g.globalCompositeOperation = "source-over";
  g.fillStyle = RISO.paper;
  g.fillRect(0, 0, w, h);
  strokeBox(ui, { x: 0, y: 0, w, h });
  g.fillStyle = RISO.ink;
  g.beginPath();
  g.moveTo(w / 2 - 5 * k, h);
  g.lineTo(w / 2 + 5 * k, h);
  g.lineTo(w / 2, h + tail);
  g.closePath();
  g.fill();
  g.textBaseline = "middle";
  g.textAlign = "left";
  g.fillText(shown, 9.5 * k, h / 2 + 0.5 * k);
  g.restore();
}

export const serifTitle = (ui: Ui, text: string, x: number, y: number, px = 22) => {
  font(ui, { px, family: "serif" });
  ui.g.fillStyle = RISO.ink;
  ui.g.fillText(text, x, y);
};
