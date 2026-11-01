import { RISO } from "@/lib/paws/riso-inks";

import { spring, SPRINGS } from "../../../engine/src/motion";

export const SERIF = '"Geist Serif", "Songti SC", Georgia, serif';
export const MONO = '"Plex Mono", "PingFang SC", ui-monospace, Menlo, monospace';

/** Draw `text` in ink with a pink plate printed a little off register, the way the share image sets its title. */
export function riso(options: { g: CanvasRenderingContext2D; text: string; x: number; y: number; offset: number; plate?: string; halo?: number; night?: number }) {
  const { g, text, x, y, offset } = options;
  const night = options.night ?? 0;
  g.save();
  if (options.halo) {
    g.save();
    g.shadowColor = "rgba(243,239,228,0.9)";
    g.shadowBlur = options.halo * (1 + 0.8 * night);
    g.fillStyle = "rgba(243,239,228,0.6)";
    for (let i = 0; i < 2 + Math.round(night * 4); i++) g.fillText(text, x, y);
    g.restore();
  }
  g.globalCompositeOperation = "multiply";
  g.fillStyle = options.plate ?? RISO.pink;
  g.fillText(text, x + offset, y + offset * 0.7);
  g.fillStyle = RISO.ink;
  g.fillText(text, x, y);
  g.restore();
}

/** Draw a caption between `from` and `to`: each word rises out of a mask on a spring, then lifts and fades away. */
export function drawCaption(options: { g: CanvasRenderingContext2D; W: number; H: number; t: number; text: string; from: number; to: number; size: "line" | "title"; y?: number; night?: number }) {
  const { g, W, H, t, from, to, night } = options;
  if (t < from - 0.05 || t > to + 1) return;
  const unit = Math.min(W, H) / 1080;
  const portrait = H > W;
  const fontPx = (options.size === "title" ? 84 : portrait ? 60 : 58) * unit;
  g.save();
  g.font = `${fontPx}px ${SERIF}`;
  g.textBaseline = "alphabetic";
  const words = options.text.split(" ");
  // Chinese captions mark their animation chunks with spaces that are not printed, and wrap into lines of even length.
  const isHan = /\p{Script=Han}/u.test(options.text);
  const space = isHan ? 0 : g.measureText(" ").width;
  const fullWidth = g.measureText(isHan ? words.join("") : options.text).width;
  const frameWidth = W * (portrait ? 0.84 : 0.8);
  const maxWidth = isHan && fullWidth > frameWidth ? (fullWidth / Math.ceil(fullWidth / frameWidth)) * 1.1 : frameWidth;
  const lines: string[][] = [[]];
  let lineWidth = 0;
  for (const word of words) {
    const w = g.measureText(word).width;
    if (lineWidth + w > maxWidth && lines.at(-1)!.length > 0) {
      lines.push([]);
      lineWidth = 0;
    }
    lines.at(-1)!.push(word);
    lineWidth += w + space;
  }
  const lineHeight = fontPx * 1.18;
  const baseY = options.y ?? (portrait ? H * 0.8 : H - 96 * unit);
  let index = 0;
  lines.forEach((line, row) => {
    const widths = line.map((w) => g.measureText(w).width);
    const total = widths.reduce((a, b) => a + b, 0) + space * (line.length - 1);
    let x = (W - total) / 2;
    const y = baseY - (lines.length - 1 - row) * lineHeight;
    line.forEach((word, i) => {
      const enter = spring(t - from - index * 0.06, SPRINGS.heavy);
      const leave = spring(t - to - index * 0.03, SPRINGS.default);
      if (enter < 0.001 || leave > 0.999) {
        x += widths[i]! + space;
        index += 1;
        return;
      }
      g.save();
      if (leave > 0) {
        g.globalAlpha = 1 - leave;
        riso({ g, text: word, x, y: y - leave * fontPx * 0.45, offset: 3 * unit, halo: 22 * unit, night });
        g.restore();
        x += widths[i]! + space;
        index += 1;
        return;
      }
      g.beginPath();
      g.rect(x - fontPx * 0.2, y - fontPx * 1.1, widths[i]! + fontPx * 0.4, fontPx * 1.45);
      g.clip();
      riso({ g, text: word, x, y: y + (1 - enter) * fontPx * 1.7, offset: 3 * unit, halo: 22 * unit, night });
      g.restore();
      x += widths[i]! + space;
      index += 1;
    });
  });
  g.restore();
}
