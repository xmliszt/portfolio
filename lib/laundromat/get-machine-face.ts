import type { IsoProjection, ScreenPoint } from "./project-iso-point";
import { projectIsoPoint } from "./project-iso-point";
import type { IsoPoint, IsoSize } from "./scene-config";

const COS_30 = Math.cos(Math.PI / 6);
const SIN_30 = Math.sin(Math.PI / 6);

type FaceRect = { x: number; y: number; width: number; height: number };

/** Return the `transform` from a machine's front-face pixels to scene pixels, the face-pixel `rects` of its parts, and each control's scene outline. */
export function getMachineFace(options: {
  position: IsoPoint;
  size: IsoSize;
  projection: IsoProjection;
}) {
  const { position, size, projection } = options;
  const { unit } = projection;
  const origin = projectIsoPoint({
    point: { x: position.x, y: position.y + size.d, z: position.z + size.h },
    projection,
  });
  const faceWidth = size.w * unit;
  const faceHeight = size.h * unit;
  const strip = { y: 0.08 * unit, height: 0.7 * unit };
  const readoutY = strip.y + strip.height + 0.08 * unit;
  const readoutHeight = 0.36 * unit;
  const doorY = readoutY + readoutHeight + 0.1 * unit;
  const rects = {
    dial: { x: 0.06 * faceWidth, width: 0.42 * faceWidth, ...strip },
    start: { x: 0.52 * faceWidth, width: 0.42 * faceWidth, ...strip },
    readout: {
      x: 0.1 * faceWidth,
      y: readoutY,
      width: 0.8 * faceWidth,
      height: readoutHeight,
    },
    door: {
      x: 0.15 * faceWidth,
      y: doorY,
      width: 0.7 * faceWidth,
      height: faceHeight - 0.15 * unit - doorY,
    },
  } satisfies { [part: string]: FaceRect };

  function toScene(point: ScreenPoint) {
    return {
      x: origin.x + point.x * COS_30,
      y: origin.y + point.x * SIN_30 + point.y,
    };
  }
  function toOutline(rect: FaceRect) {
    return [
      { x: rect.x, y: rect.y },
      { x: rect.x + rect.width, y: rect.y },
      { x: rect.x + rect.width, y: rect.y + rect.height },
      { x: rect.x, y: rect.y + rect.height },
    ].map(toScene);
  }

  return {
    transform: `matrix(${COS_30} ${SIN_30} 0 1 ${origin.x} ${origin.y})`,
    rects,
    controlOutlines: {
      dial: toOutline(rects.dial),
      start: toOutline(rects.start),
      door: toOutline(rects.door),
    },
  };
}
