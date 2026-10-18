import type { DoodleStroke } from "@/lib/laundromat/notebook/doodle-stroke";
import { toStrokePath } from "@/lib/laundromat/notebook/to-stroke-path";
import type { NotebookPage as NotebookPageSettings } from "@/lib/laundromat/scene-config";

import type {
  DoodleView,
  PadView,
  PageContent,
  RowView,
} from "./notebook-page";
import { NOTEBOOK_PAGE_METRICS } from "./notebook-page-metrics";

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

export type PageSpec = {
  content: PageContent;
  rows: RowView[];
  doodles: DoodleView[];
  pad: PadView | undefined;
};

const SPINE_SHADOW_STEP_PX = 2;

function getNormalTail(z: number) {
  const u = Math.abs(z) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * u);
  const erfc =
    t *
    (0.254829592 +
      t *
        (-0.284496736 +
          t * (1.421413741 + t * (-1.453152027 + t * 1.061405429)))) *
    Math.exp(-u * u);
  return z >= 0 ? erfc / 2 : 1 - erfc / 2;
}

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
  fontPx: number;
  top: number;
  lineHeightPx: number;
  devicePixelRatio: number;
}) {
  const metrics = options.context.measureText("");
  // Firefox before 116 has no font bounding box metrics.
  const ascent = Math.round(
    metrics.fontBoundingBoxAscent ?? options.fontPx * 0.8
  );
  const descent = Math.round(
    metrics.fontBoundingBoxDescent ?? options.fontPx * 0.2
  );
  const y =
    options.top + (options.lineHeightPx - ascent - descent) / 2 + ascent;
  return snapToDevicePixel({
    value: y,
    devicePixelRatio: options.devicePixelRatio,
  });
}

function paintStrokes(options: {
  context: CanvasRenderingContext2D;
  strokes: DoodleStroke[];
  left: number;
  top: number;
  strokeWidthPx: number;
}) {
  const { context } = options;
  context.save();
  context.translate(options.left, options.top);
  context.lineWidth = options.strokeWidthPx;
  context.lineCap = "round";
  context.lineJoin = "round";
  for (const stroke of options.strokes) {
    const [x, y] = stroke.points[0];
    if (stroke.points.length === 1) {
      context.beginPath();
      context.arc(x, y, options.strokeWidthPx * 0.7, 0, Math.PI * 2);
      context.fill();
    } else {
      context.stroke(new Path2D(toStrokePath(stroke.points)));
    }
  }
  context.restore();
}

function paintSpineShadow(options: {
  context: CanvasRenderingContext2D;
  side: "left" | "right";
  width: number;
  height: number;
}) {
  const { context, side, width, height } = options;
  const { offsetPx, blurPx, spreadPx, alpha } =
    NOTEBOOK_PAGE_METRICS.spineShadow;
  const holeEdgePx = offsetPx + spreadPx;
  const shadowWidth = blurPx + Math.max(0, holeEdgePx);
  const gradient = context.createLinearGradient(
    side === "right" ? 0 : width,
    0,
    side === "right" ? shadowWidth : width - shadowWidth,
    0
  );
  for (let x = 0; x <= shadowWidth; x += SPINE_SHADOW_STEP_PX) {
    const stopAlpha = alpha * getNormalTail((x - holeEdgePx) / (blurPx / 2));
    gradient.addColorStop(x / shadowWidth, `rgb(0 0 0 / ${stopAlpha})`);
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
  strokeWidthPx: number;
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
    strokeWidthPx,
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
  paintSpineShadow({
    context,
    side,
    width: settings.width,
    height: settings.height,
  });
  context.fillStyle = palette.paperRule;
  const bodyHeight =
    settings.height - settings.marginTop - settings.marginBottom;
  const ruleCount = Math.round(bodyHeight / pitch);
  const { pad } = page;
  for (let rule = 1; rule <= ruleCount; rule += 1) {
    const row = rule - 1;
    if (
      pad !== undefined &&
      row >= pad.row &&
      row < pad.row + pad.rowCount - 1
    ) {
      continue;
    }
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
    const isInkHidden =
      row.kind === "text" ? row.ink === "waiting" : row.ink !== "plain";
    if (isInkHidden) continue;
    const drop = row.kind === "text" ? pitch * settings.textDropRatio : 0;
    context.direction = row.isRtl && row.kind === "text" ? "rtl" : "ltr";
    context.textAlign = row.isRtl ? "right" : "left";
    const x = row.isRtl ? settings.width - settings.marginX : settings.marginX;
    const fontPx =
      row.kind === "meta" ? NOTEBOOK_PAGE_METRICS.metaFontPx : row.fontSizePx;
    context.globalAlpha = row.kind === "meta" ? 0.45 : 1;
    context.font = `${fontPx}px ${row.kind === "meta" ? palette.monoFont : row.fontFamily}`;
    const y = getBaselineY({
      context,
      fontPx,
      top: settings.marginTop + row.row * pitch + drop,
      lineHeightPx: pitch,
      devicePixelRatio,
    });
    context.fillText(row.text, x, y);
  }
  context.globalAlpha = 1;
  context.direction = "ltr";

  context.strokeStyle = palette.inkPen;
  context.fillStyle = palette.inkPen;
  for (const doodle of page.doodles) {
    if (doodle.ink === "waiting") continue;
    paintStrokes({
      context,
      strokes: doodle.strokes,
      left: settings.marginX,
      top: settings.marginTop + doodle.row * pitch,
      strokeWidthPx,
    });
  }
  if (pad !== undefined) {
    context.globalAlpha = pad.tone === "remote" ? 0.45 : 1;
    paintStrokes({
      context,
      strokes: pad.strokes,
      left: settings.marginX,
      top: settings.marginTop + pad.row * pitch,
      strokeWidthPx,
    });
    context.globalAlpha = 1;
  }

  if (content.kind === "paper") {
    context.globalAlpha = 0.5;
    context.textAlign = "center";
    const { pageNumber } = NOTEBOOK_PAGE_METRICS;
    context.font = `${pageNumber.fontPx}px ${palette.displayFont}`;
    const y = getBaselineY({
      context,
      fontPx: pageNumber.fontPx,
      top:
        settings.height -
        pageNumber.bottomPx -
        pageNumber.paddingYPx -
        pageNumber.lineHeightPx,
      lineHeightPx: pageNumber.lineHeightPx,
      devicePixelRatio,
    });
    context.fillText(String(content.page), centerX, y);
    context.globalAlpha = 1;
  }
}
