import type { FaceRect } from "./get-face-plane";
import { getFacePlane } from "./get-face-plane";
import type { IsoProjection } from "./project-iso-point";
import type { IsoPoint, IsoSize } from "./scene-config";

const BASE_HEIGHT = 0.3;

/** Return the base height and the `transform` from the front of a coffee machine's base to scene pixels, the face-pixel `rects` on it, and the switch's scene outline. */
export function getCoffeeMachineFace(options: {
  position: IsoPoint;
  size: IsoSize;
  projection: IsoProjection;
}) {
  const { position, size, projection } = options;
  const { unit } = projection;
  const plane = getFacePlane({
    plane: "front",
    origin: {
      x: position.x,
      y: position.y + size.d,
      z: position.z + BASE_HEIGHT,
    },
    projection,
  });
  const width = size.w * unit;
  const height = BASE_HEIGHT * unit;
  const rects = {
    base: { x: 0, y: 0, width, height },
    switch: { x: width - 0.84 * unit, y: 0, width: 0.8 * unit, height },
  } satisfies { [part: string]: FaceRect };

  return {
    baseHeight: BASE_HEIGHT,
    transform: plane.transform,
    rects,
    controlOutlines: { switch: plane.toOutline(rects.switch) },
  };
}
