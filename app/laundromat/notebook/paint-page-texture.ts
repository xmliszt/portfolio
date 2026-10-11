import type { NotebookPage as NotebookPageSettings } from "@/lib/laundromat/scene-config";

import type { PageContent, RowView } from "./notebook-page";

export type PagePalette = {
  paper: string;
  paperRule: string;
  inkPen: string;
  cover: string;
  coverLine: string;
  coverInk: string;
  displayFont: string;
};

export type PageSpec = { content: PageContent; rows: RowView[] };

type PaintPageTextureOptions = {
  canvas: HTMLCanvasElement;
  page: PageSpec;
  settings: NotebookPageSettings;
  pitch: number;
  palette: PagePalette;
  dpr: number;
};

/** Draw `page` into `canvas` the way `NotebookPage` lays it out in the DOM, for use as a WebGL texture. */
export function paintPageTexture(options: PaintPageTextureOptions) {
  const { canvas, page, settings, pitch, palette, dpr } = options;
  canvas.width = Math.round(settings.width * dpr);
  canvas.height = Math.round(settings.height * dpr);
  const context = canvas.getContext("2d");
  if (context === null) return;
  context.scale(dpr, dpr);
  const { content } = page;
  const centerX = settings.width / 2;
  const centerY = settings.height / 2;

  switch (content.kind) {
    case "cover":
      context.fillStyle = palette.cover;
      context.fillRect(0, 0, settings.width, settings.height);
      context.fillStyle = palette.coverInk;
      context.font = `28px ${palette.displayFont}`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(`No. ${content.number}`, centerX, centerY);
      return;
    case "inside":
      context.fillStyle = palette.paperRule;
      context.fillRect(0, 0, settings.width, settings.height);
      context.fillStyle = palette.inkPen;
      context.globalAlpha = 0.6;
      context.font = `22px ${palette.displayFont}`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(`No. ${content.number}`, centerX, centerY - 10);
      context.globalAlpha = 0.5;
      context.font = `11px ${palette.displayFont}`;
      context.fillText(content.span, centerX, centerY + 18);
      return;
    case "blank":
    case "paper":
      break;
    default: {
      const unhandled: never = content;
      return unhandled;
    }
  }

  context.fillStyle = palette.paper;
  context.fillRect(0, 0, settings.width, settings.height);
  context.fillStyle = palette.paperRule;
  const bodyHeight =
    settings.height - settings.marginTop - settings.marginBottom;
  const ruleCount = Math.round(bodyHeight / pitch);
  for (let rule = 1; rule <= ruleCount; rule += 1) {
    context.fillRect(
      0,
      settings.marginTop + rule * pitch - 1,
      settings.width,
      1
    );
  }

  context.fillStyle = palette.inkPen;
  context.textBaseline = "middle";
  for (const row of page.rows) {
    const drop = row.kind === "text" ? pitch * settings.textDropRatio : 0;
    const y = settings.marginTop + row.row * pitch + pitch / 2 + drop;
    context.direction = row.isRtl ? "rtl" : "ltr";
    context.textAlign = row.isRtl ? "right" : "left";
    const x = row.isRtl ? settings.width - settings.marginX : settings.marginX;
    if (row.kind === "meta") {
      context.globalAlpha = 0.45;
      context.font = `11px ${palette.displayFont}`;
    } else {
      context.globalAlpha = 1;
      context.font = `${row.fontSizePx}px ${row.fontFamily}`;
    }
    context.fillText(row.text, x, y);
  }
  context.globalAlpha = 1;
  context.direction = "ltr";

  if (content.kind === "paper") {
    context.globalAlpha = 0.5;
    context.textAlign = "center";
    context.font = `13px ${palette.displayFont}`;
    context.fillText(String(content.page), centerX, settings.height - 30);
    context.globalAlpha = 1;
  }
}
