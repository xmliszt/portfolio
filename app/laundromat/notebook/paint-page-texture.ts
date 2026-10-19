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

/** The CSS `filter` for doodle strokes, and the width scale and opacity of the body stroke drawn under each line. */
export type CrayonInk = {
  filter: string;
  bodyWidthScale: number;
  bodyOpacity: number;
};

const SPINE_SHADOW_STEP_PX = 2;
// Canvas text renders heavier than the DOM's `antialiased` text; drawing it larger and scaling down matches the DOM weight.
const TEXT_SUPERSAMPLE = 3;

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

/** Draw `text` like `context.fillText`, but rasterised at `TEXT_SUPERSAMPLE` times the canvas resolution on `layer` and scaled down onto `context`. */
function fillThinText(options: {
  context: CanvasRenderingContext2D;
  layer: HTMLCanvasElement;
  text: string;
  x: number;
  y: number;
}) {
  const { context, layer } = options;
  const layerContext = layer.getContext("2d");
  if (layerContext === null) {
    context.fillText(options.text, options.x, options.y);
    return;
  }
  const resolution = context.getTransform().a;
  const scale = resolution * TEXT_SUPERSAMPLE;
  const metrics = context.measureText(options.text);
  const top = options.y - metrics.actualBoundingBoxAscent - 2;
  const height =
    metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent + 4;
  layer.width = context.canvas.width * TEXT_SUPERSAMPLE;
  layer.height = Math.ceil(height * scale);
  layerContext.setTransform(scale, 0, 0, scale, 0, -top * scale);
  layerContext.font = context.font;
  layerContext.fillStyle = context.fillStyle;
  layerContext.textAlign = context.textAlign;
  layerContext.textBaseline = context.textBaseline;
  layerContext.direction = context.direction;
  layerContext.fillText(options.text, options.x, options.y);
  context.save();
  context.resetTransform();
  context.imageSmoothingQuality = "high";
  context.drawImage(
    layer,
    0,
    top * resolution,
    context.canvas.width,
    layer.height / TEXT_SUPERSAMPLE
  );
  context.restore();
}

function traceStrokes(options: {
  context: CanvasRenderingContext2D;
  strokes: DoodleStroke[];
  left: number;
  top: number;
  lineWidthPx: number;
  dotRadiusPx: number | undefined;
}) {
  const { context } = options;
  context.save();
  context.translate(options.left, options.top);
  context.lineWidth = options.lineWidthPx;
  context.lineCap = "round";
  context.lineJoin = "round";
  for (const stroke of options.strokes) {
    const [x, y] = stroke.points[0];
    if (stroke.points.length > 1) {
      context.stroke(new Path2D(toStrokePath(stroke.points)));
    } else if (options.dotRadiusPx !== undefined) {
      context.beginPath();
      context.arc(x, y, options.dotRadiusPx, 0, Math.PI * 2);
      context.fill();
    }
  }
  context.restore();
}

type DoodlePlacement = { strokes: DoodleStroke[]; left: number; top: number };

function paintDoodles(options: {
  context: CanvasRenderingContext2D;
  layer: HTMLCanvasElement;
  doodles: DoodlePlacement[];
  strokeWidthPx: number;
  crayon: CrayonInk | undefined;
  opacity: number;
}) {
  const { context, layer, crayon, strokeWidthPx } = options;
  if (options.doodles.length === 0) return;
  if (crayon === undefined) {
    context.globalAlpha = options.opacity;
    for (const placement of options.doodles) {
      traceStrokes({
        context,
        ...placement,
        lineWidthPx: strokeWidthPx,
        dotRadiusPx: strokeWidthPx * 0.7,
      });
    }
    context.globalAlpha = 1;
    return;
  }
  layer.width = context.canvas.width;
  layer.height = context.canvas.height;
  const layerContext = layer.getContext("2d");
  if (layerContext === null) return;
  layerContext.setTransform(context.getTransform());
  layerContext.strokeStyle = context.strokeStyle;
  layerContext.fillStyle = context.fillStyle;
  const bodyWidthPx = strokeWidthPx * crayon.bodyWidthScale;
  for (const placement of options.doodles) {
    layerContext.globalAlpha = crayon.bodyOpacity;
    traceStrokes({
      context: layerContext,
      ...placement,
      lineWidthPx: bodyWidthPx,
      dotRadiusPx: undefined,
    });
    layerContext.globalAlpha = 1;
    traceStrokes({
      context: layerContext,
      ...placement,
      lineWidthPx: strokeWidthPx,
      dotRadiusPx: bodyWidthPx * 0.7,
    });
  }
  context.save();
  context.resetTransform();
  context.filter = crayon.filter;
  context.globalAlpha = options.opacity;
  context.drawImage(layer, 0, 0);
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
  crayon: CrayonInk | undefined;
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
    crayon,
    palette,
    devicePixelRatio,
    resolution,
  } = options;
  canvas.width = Math.round(settings.width * resolution);
  canvas.height = Math.round(settings.height * resolution);
  const context = canvas.getContext("2d");
  if (context === null) return;
  context.scale(resolution, resolution);
  const layer = document.createElement("canvas");
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
      fillThinText({
        context,
        layer,
        text: `No. ${content.number}`,
        x: centerX,
        y: centerY,
      });
      return;
    case "inside":
      context.fillStyle = palette.paperRule;
      context.fillRect(0, 0, settings.width, settings.height);
      context.fillStyle = palette.inkPen;
      context.globalAlpha = 0.6;
      context.font = `22px ${palette.displayFont}`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      fillThinText({
        context,
        layer,
        text: `No. ${content.number}`,
        x: centerX,
        y: centerY - 10,
      });
      context.globalAlpha = 0.5;
      context.font = `11px ${palette.displayFont}`;
      fillThinText({
        context,
        layer,
        text: content.span,
        x: centerX,
        y: centerY + 18,
      });
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
    fillThinText({ context, layer, text: row.text, x, y });
  }
  context.globalAlpha = 1;
  context.direction = "ltr";

  context.strokeStyle = palette.inkPen;
  context.fillStyle = palette.inkPen;
  paintDoodles({
    context,
    layer,
    doodles: page.doodles
      .filter((doodle) => doodle.ink !== "waiting")
      .map((doodle) => ({
        strokes: doodle.strokes,
        left: settings.marginX,
        top: settings.marginTop + doodle.row * pitch,
      })),
    strokeWidthPx,
    crayon,
    opacity: 1,
  });
  if (pad !== undefined) {
    paintDoodles({
      context,
      layer,
      doodles: [
        {
          strokes: pad.strokes,
          left: settings.marginX,
          top: settings.marginTop + pad.row * pitch,
        },
      ],
      strokeWidthPx,
      crayon,
      opacity: pad.tone === "remote" ? 0.45 : 1,
    });
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
    fillThinText({
      context,
      layer,
      text: String(content.page),
      x: centerX,
      y,
    });
    context.globalAlpha = 1;
  }
}
