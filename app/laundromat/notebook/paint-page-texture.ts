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
  monoFont: string;
};

export type PageSpec = { content: PageContent; rows: RowView[] };

const META_FONT_PX = 11;
const PAGE_NUMBER = { fontPx: 13, lineHeightPx: 19.5, bottomPx: 24 };
// Alpha of `NotebookPage`'s inset spine shadow (18px offset, 24px blur, -20px spread, 0.35 alpha) by distance from the spine.
const SPINE_SHADOW_STOPS = [
  { offsetPx: 0, alpha: 0.152 },
  { offsetPx: 4, alpha: 0.108 },
  { offsetPx: 8, alpha: 0.071 },
  { offsetPx: 12, alpha: 0.043 },
  { offsetPx: 18, alpha: 0.017 },
  { offsetPx: 26, alpha: 0 },
];

function snapToDevicePixel(options: {
  value: number;
  devicePixelRatio: number;
}) {
  return (
    Math.round(options.value * options.devicePixelRatio) /
    options.devicePixelRatio
  );
}

function getBaselineY(options: {
  context: CanvasRenderingContext2D;
  top: number;
  lineHeightPx: number;
  devicePixelRatio: number;
}) {
  const metrics = options.context.measureText("");
  const ascent = Math.round(metrics.fontBoundingBoxAscent);
  const descent = Math.round(metrics.fontBoundingBoxDescent);
  const y =
    options.top + (options.lineHeightPx - ascent - descent) / 2 + ascent;
  return snapToDevicePixel({
    value: y,
    devicePixelRatio: options.devicePixelRatio,
  });
}

function paintSpineShadow(options: {
  context: CanvasRenderingContext2D;
  side: "left" | "right";
  width: number;
  height: number;
}) {
  const { context, side, width, height } = options;
  const spineX = side === "right" ? 0 : width;
  const shadowWidth = SPINE_SHADOW_STOPS.at(-1)?.offsetPx ?? 0;
  const gradient = context.createLinearGradient(
    spineX,
    0,
    side === "right" ? shadowWidth : width - shadowWidth,
    0
  );
  for (const stop of SPINE_SHADOW_STOPS) {
    gradient.addColorStop(
      stop.offsetPx / shadowWidth,
      `rgb(0 0 0 / ${stop.alpha})`
    );
  }
  context.fillStyle = gradient;
  context.fillRect(
    side === "right" ? 0 : width - shadowWidth,
    0,
    shadowWidth,
    height
  );
}

type PaintPageTextureOptions = {
  canvas: HTMLCanvasElement;
  page: PageSpec;
  side: "left" | "right";
  settings: NotebookPageSettings;
  pitch: number;
  palette: PagePalette;
  devicePixelRatio: number;
  resolution: number;
};

/** Draw `page` into `canvas` at `resolution` canvas pixels per page pixel, laid out and snapped to `devicePixelRatio` the way `NotebookPage` renders in the DOM, for use as a WebGL texture. */
export function paintPageTexture(options: PaintPageTextureOptions) {
  const {
    canvas,
    page,
    side,
    settings,
    pitch,
    palette,
    devicePixelRatio,
    resolution,
  } = options;
  canvas.width = Math.round(settings.width * resolution);
  canvas.height = Math.round(settings.height * resolution);
  const context = canvas.getContext("2d");
  if (context === null) return;
  context.scale(resolution, resolution);
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
      snapToDevicePixel({
        value: settings.marginTop + rule * pitch - 1,
        devicePixelRatio,
      }),
      settings.width,
      1
    );
  }

  context.fillStyle = palette.inkPen;
  context.textBaseline = "alphabetic";
  for (const row of page.rows) {
    const drop = row.kind === "text" ? pitch * settings.textDropRatio : 0;
    context.direction = row.isRtl && row.kind === "text" ? "rtl" : "ltr";
    context.textAlign = row.isRtl ? "right" : "left";
    const x = row.isRtl ? settings.width - settings.marginX : settings.marginX;
    if (row.kind === "meta") {
      context.globalAlpha = 0.45;
      context.font = `${META_FONT_PX}px ${palette.monoFont}`;
    } else {
      context.globalAlpha = 1;
      context.font = `${row.fontSizePx}px ${row.fontFamily}`;
    }
    const y = getBaselineY({
      context,
      top: settings.marginTop + row.row * pitch + drop,
      lineHeightPx: pitch,
      devicePixelRatio,
    });
    context.fillText(row.text, x, y);
  }
  context.globalAlpha = 1;
  context.direction = "ltr";

  if (content.kind === "paper") {
    context.globalAlpha = 0.5;
    context.textAlign = "center";
    context.font = `${PAGE_NUMBER.fontPx}px ${palette.displayFont}`;
    const y = getBaselineY({
      context,
      top: settings.height - PAGE_NUMBER.bottomPx - PAGE_NUMBER.lineHeightPx,
      lineHeightPx: PAGE_NUMBER.lineHeightPx,
      devicePixelRatio,
    });
    context.fillText(String(content.page), centerX, y);
    context.globalAlpha = 1;
  }

  paintSpineShadow({
    context,
    side,
    width: settings.width,
    height: settings.height,
  });
}
