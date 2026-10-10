import type { FaceRect } from "./get-face-plane";
import { getFacePlane } from "./get-face-plane";
import type { IsoProjection } from "./project-iso-point";
import type { IsoPoint, IsoSize } from "./scene-config";

/** Return the `transform` from the front of a left-wall TV (its x-max face) to scene pixels, the face-pixel `rects` of its parts, and each control's scene outline. */
export function getTvFace(options: {
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
  const inset = 0.1 * unit;
  const column = { x: 0.66 * width, width: 0.32 * width };
  const rects = {
    body: { x: 0, y: 0, width, height },
    screen: {
      x: inset,
      y: inset,
      width: column.x - 2 * inset,
      height: height - 0.5 * unit,
    },
    grille: {
      x: inset,
      y: height - 0.32 * unit,
      width: column.x - 2 * inset,
      height: 0.2 * unit,
    },
    tuner: { ...column, y: inset, height: 0.66 * unit },
    volume: { ...column, y: 0.8 * unit, height: 0.56 * unit },
    power: { ...column, y: 1.38 * unit, height: height - 1.46 * unit },
  } satisfies { [part: string]: FaceRect };

  return {
    transform: plane.transform,
    rects,
    controlOutlines: {
      tuner: plane.toOutline(rects.tuner),
      volume: plane.toOutline(rects.volume),
      power: plane.toOutline(rects.power),
      screen: plane.toOutline(rects.screen),
    },
  };
}
