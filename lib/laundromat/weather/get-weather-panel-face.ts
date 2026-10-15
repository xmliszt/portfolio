import type { FaceRect } from "@/lib/laundromat/get-face-plane";
import { getFacePlane } from "@/lib/laundromat/get-face-plane";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import type { IsoPoint, IsoSize } from "@/lib/laundromat/scene-config";

const BEZEL = 0.12;
const CHIN = 0.2;
const GLYPH_COLUMN = 0.34;
const RANGE_ROW = 0.24;

export type WeatherPanelRects = ReturnType<typeof getWeatherPanelFace>["rects"];

/** Return the `transform` from the front of a left-wall weather panel (its x-max face) to scene pixels, and the face-pixel `rects` of its bezel, screen and screen regions. */
export function getWeatherPanelFace(options: {
  position: IsoPoint;
  size: IsoSize;
  projection: IsoProjection;
}) {
  const { position, size, projection } = options;
  const { unit } = projection;
  const plane = getFacePlane({
    plane: "side",
    origin: {
      x: position.x + size.w,
      y: position.y + size.d,
      z: position.z + size.h,
    },
    projection,
  });
  const width = size.d * unit;
  const height = size.h * unit;
  const bezel = BEZEL * unit;
  const chinTop = height - CHIN * unit;
  const screen = {
    x: bezel,
    y: bezel,
    width: width - 2 * bezel,
    height: chinTop - 1.5 * bezel,
  };
  const pad = bezel * 0.8;
  const rangeHeight = RANGE_ROW * screen.height;
  const glyphWidth = GLYPH_COLUMN * screen.width;
  const reading = {
    x: screen.x + pad,
    y: screen.y + pad,
    width: screen.width - glyphWidth - 2 * pad,
    height: screen.height - rangeHeight - 2 * pad,
  };
  const rects = {
    body: { x: 0, y: 0, width, height },
    screen,
    reading,
    glyph: {
      x: screen.x + screen.width - glyphWidth - pad,
      y: screen.y + pad,
      width: glyphWidth,
      height: reading.height,
    },
    range: {
      x: screen.x,
      y: screen.y + screen.height - rangeHeight,
      width: screen.width,
      height: rangeHeight,
    },
    chin: {
      x: 0,
      y: chinTop,
      width,
      height: height - chinTop,
    },
  } satisfies { [part: string]: FaceRect };
  return { transform: plane.transform, rects };
}
