import { COAT_INKS, type CatLook, PAD_INKS, PATTERNS } from "@/lib/paws/cat-look";
import { coatInkOptions } from "@/lib/paws/maker/coat-ink-options";
import { padInkOptions } from "@/lib/paws/maker/pad-ink-options";
import { RISO } from "@/lib/paws/riso-inks";
import { AGES, MOODS, VOICES } from "@/lib/paws/voice-settings";

import { COPY } from "./copy";
import { type Box, buttonWidth, center, font, paperFill, pointer, risoButton, segmented, strokeBox, swatchPicker, tabs, type Ui } from "./ui";

export type MakerTab = "coat" | "pattern" | "belly" | "pads" | "shape";
export type StudioState =
  | { kind: "maker"; tab: MakerTab; look: CatLook; pressed: string | undefined; press: number }
  | { kind: "voice"; age: string; voice: string; mood: string; busy: boolean; pressed: string | undefined; press: number };

export type StudioLayout = { title: Box; square: Box; dock: Box; k: number };

/** Return where the studio puts its title, the cat's square and the dock in a `W` by `H` frame at `k` film pixels per CSS pixel, following `StudioFrame`'s sizes. */
export function studioLayout(options: { W: number; H: number; k: number }): StudioLayout {
  const { W, H, k } = options;
  const portrait = H > W;
  const dockW = Math.min(560 * k, W - 32 * k);
  const dockH = 252 * k;
  const top = (portrait ? 120 : 20) * k;
  const title = { x: 0, y: top, w: W, h: (portrait ? 56 : 22) * k };
  const bottom = H - (portrait ? 140 : 16) * k;
  const dock = { x: (W - dockW) / 2, y: bottom - dockH, w: dockW, h: dockH };
  const free = dock.y - (title.y + title.h) - 32 * k;
  const side = Math.min(W * 0.84, free);
  const square = { x: (W - side) / 2, y: title.y + title.h + 16 * k + (free - side) / 2, w: side, h: side };
  return { title, square, dock, k };
}

const en = COPY.app;

const TAB_LABELS = (["coat", "pattern", "belly", "pads", "shape"] as const).map((value) => ({ value, label: en.maker.tabs[value] }));

/** Draw the studio's header, dock and controls for `state`, rising in by `rise` (1 settled), and return the boxes a pointer can click by name. */
export function drawStudio(ui: Ui, options: { layout: StudioLayout; state: StudioState; rise: { title: number; dock: number }; grain: CanvasPattern | undefined }) {
  const { g, k } = ui;
  const { layout, state } = options;
  const targets: { [name: string]: Box } = {};
  const portrait = layout.square.h > 0 && layout.title.h > 22 * k;

  g.save();
  g.translate(0, (1 - options.rise.title) * -6 * k * 4);
  g.globalAlpha = Math.min(1, options.rise.title * 1.4);
  const title = state.kind === "maker" ? en.maker.title : en.voice.title;
  const eyebrow = (state.kind === "maker" ? en.maker.eyebrow : en.voice.eyebrow).toUpperCase();
  font(ui, { px: 22, family: "serif" });
  const titleW = g.measureText(title).width;
  font(ui, { px: 11 });
  const eyebrowW = [...eyebrow].reduce((w, ch) => w + g.measureText(ch).width + 11 * 0.12 * k, 0) + 12 * k;
  const drawEyebrow = (x: number, y: number) => {
    g.fillStyle = RISO.orange;
    g.fillRect(x, y - 4.5 * k, 6 * k, 6 * k);
    font(ui, { px: 11 });
    g.fillStyle = RISO.inkSoft;
    let cx = x + 12 * k;
    for (const ch of eyebrow) {
      g.fillText(ch, cx, y);
      cx += g.measureText(ch).width + 11 * 0.12 * k;
    }
  };
  g.textBaseline = "alphabetic";
  g.textAlign = "left";
  if (portrait) {
    font(ui, { px: 22, family: "serif" });
    g.fillStyle = RISO.ink;
    g.fillText(title, (layout.title.w - titleW) / 2, layout.title.y + 22 * k);
    drawEyebrow((layout.title.w - eyebrowW) / 2, layout.title.y + 46 * k);
  } else {
    const total = titleW + 16 * k + eyebrowW;
    const x = (layout.title.w - total) / 2;
    font(ui, { px: 22, family: "serif" });
    g.fillStyle = RISO.ink;
    g.fillText(title, x, layout.title.y + 20 * k);
    drawEyebrow(x + titleW + 16 * k, layout.title.y + 20 * k);
  }
  g.restore();

  g.save();
  const dockShift = (1 - options.rise.dock) * 24 * k * 4;
  g.translate(0, dockShift);
  g.globalAlpha = Math.min(1, options.rise.dock * 1.4);
  const dock = layout.dock;
  paperFill(ui, dock, options.grain);
  strokeBox(ui, dock);
  const footerH = 56 * k;
  const footerY = dock.y + dock.h - footerH;
  g.fillStyle = RISO.rule;
  g.fillRect(dock.x + 1.5 * k, footerY, dock.w - 3 * k, 1.5 * k);
  const pad = 12 * k;
  const inner = { x: dock.x + pad, w: dock.w - 2 * pad };
  const pressOf = (name: string) => (state.pressed === name ? state.press : 0);

  if (state.kind === "maker") {
    const tabBoxes = tabs(ui, { x: inner.x, y: dock.y + pad + 2 * k, labels: TAB_LABELS, active: state.tab });
    for (const tab of tabBoxes) targets[`tab:${tab.value}`] = tab.box;
    font(ui, { px: 12 });
    const shuffleW = g.measureText(en.maker.shuffle).width;
    const shuffle = { x: inner.x + inner.w - shuffleW, y: dock.y + pad + 2 * k, w: shuffleW, h: 20 * k };
    g.fillStyle = RISO.ink;
    g.textBaseline = "middle";
    g.fillText(en.maker.shuffle, shuffle.x, shuffle.y + 10 * k);
    g.fillRect(shuffle.x, shuffle.y + 17 * k, shuffleW, 1 * k);
    targets.shuffle = shuffle;
    const panelY = dock.y + pad + 20 * k + 24 * k;
    const look = state.look;
    if (state.tab === "coat" || state.tab === "pads") {
      const isCoat = state.tab === "coat";
      const swatches = isCoat
        ? coatInkOptions().map((coat) => ({ value: coat, label: en.options.coat[coat], fill: COAT_INKS[coat] }))
        : padInkOptions().map((pads) => ({ value: pads, label: en.options.pads[pads], fill: pads === "mixed" ? [PAD_INKS.pink, PAD_INKS.black] : PAD_INKS[pads] }));
      const value = isCoat ? look.coat : look.pads;
      const boxes = swatchPicker(ui, {
        x: inner.x,
        y: panelY,
        w: inner.w,
        legend: isCoat ? en.maker.coat : en.maker.pads,
        chosen: swatches.find((s) => s.value === value)?.label ?? "",
        options: swatches,
        value,
      });
      for (const b of boxes) targets[`${state.tab}:${b.value}`] = b.box;
    } else if (state.tab === "pattern") {
      const boxes = segmented(ui, { x: inner.x, y: panelY, w: inner.w, legend: en.maker.pattern, options: PATTERNS.map((p) => ({ value: p, label: en.options.pattern[p] })), value: look.pattern, columns: 3 });
      for (const b of boxes) targets[`pattern:${b.value}`] = b.box;
    }
    const nextW = buttonWidth(ui, en.maker.next, 500);
    const next = { x: dock.x + dock.w - pad - nextW, y: footerY + pad, w: nextW, h: 32 * k };
    risoButton(ui, { box: next, label: en.maker.next, variant: "primary", press: pressOf("next") });
    targets.next = next;
  } else {
    let y = dock.y + pad;
    const rows = [
      { name: "age", legend: en.voice.age, options: AGES.map((v) => ({ value: v, label: en.options.age[v] })), value: state.age, columns: 3 },
      { name: "voice", legend: en.voice.voice, options: VOICES.map((v) => ({ value: v, label: en.options.voice[v] })), value: state.voice, columns: 4 },
      { name: "mood", legend: en.voice.mood, options: MOODS.map((v) => ({ value: v, label: en.options.mood[v] })), value: state.mood, columns: 3 },
    ];
    for (const row of rows) {
      const boxes = segmented(ui, { x: inner.x, y, w: inner.w, legend: row.legend, options: row.options, value: row.value, columns: row.columns });
      for (const b of boxes) targets[`${row.name}:${b.value}`] = b.box;
      y += 18 * k + 31 * k + 8 * k;
    }
    const playW = buttonWidth(ui, en.voice.play, 400, 18 * k);
    const play = { x: inner.x, y: footerY + pad, w: playW, h: 32 * k };
    risoButton(ui, { box: play, label: en.voice.play, variant: "quiet", press: pressOf("play"), icon: (box) => speaker(ui, box) });
    targets.play = play;
    const label = state.busy ? en.voice.bringing : en.voice.bringIn;
    const bringW = buttonWidth(ui, en.voice.bringIn, 500) + 20 * k;
    const bring = { x: dock.x + dock.w - pad - bringW, y: footerY + pad, w: bringW, h: 32 * k };
    risoButton(ui, { box: bring, label, variant: "primary", press: pressOf("bring") });
    targets.bring = bring;
    const backW = buttonWidth(ui, en.common.back, 400);
    const back = { x: bring.x - 12 * k - backW, y: bring.y, w: backW, h: 32 * k };
    risoButton(ui, { box: back, label: en.common.back, variant: "quiet" });
  }
  g.restore();
  return targets;
}

function speaker(ui: Ui, box: Box) {
  const { g, k } = ui;
  const c = center(box);
  g.save();
  g.fillStyle = RISO.ink;
  g.strokeStyle = RISO.ink;
  g.lineWidth = 1.4 * k;
  g.beginPath();
  g.moveTo(c.x - 5 * k, c.y - 2.5 * k);
  g.lineTo(c.x - 2.5 * k, c.y - 2.5 * k);
  g.lineTo(c.x + 1.5 * k, c.y - 5.5 * k);
  g.lineTo(c.x + 1.5 * k, c.y + 5.5 * k);
  g.lineTo(c.x - 2.5 * k, c.y + 2.5 * k);
  g.lineTo(c.x - 5 * k, c.y + 2.5 * k);
  g.closePath();
  g.fill();
  g.beginPath();
  g.arc(c.x + 2 * k, c.y, 5 * k, -0.9, 0.9);
  g.stroke();
  g.restore();
}

export { pointer };
