import type { FaceRect } from "./get-face-plane";
import { getFacePlane } from "./get-face-plane";
import { getIsoEllipse } from "./get-iso-ellipse";
import type { IsoProjection, ScreenPoint } from "./project-iso-point";
import type { IsoPoint, IsoSize } from "./scene-config";

const BASE_HEIGHT = 0.3;

export const COFFEE_FOOT_HEIGHT = 0.05;

export const COFFEE_TOWER_DEPTH = 0.42;

export const COFFEE_CARAFE = {
  radius: 0.26,
  topRadius: 0.21,
  bottom: 0.32,
  top: 0.9,
  depthFromTower: 0.3,
};

/** Return the base height and the `transform` from the front of a coffee machine's base to scene pixels, the face-pixel `rects` on it, and the scene outlines of the switch and the carafe. */
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
  const height = (BASE_HEIGHT - COFFEE_FOOT_HEIGHT) * unit;
  const rects = {
    base: { x: 0, y: 0, width, height },
    switch: { x: width - 0.84 * unit, y: 0, width: 0.8 * unit, height },
  } satisfies { [part: string]: FaceRect };

  const carafeCenter = {
    x: position.x + size.w / 2,
    y: position.y + COFFEE_TOWER_DEPTH + COFFEE_CARAFE.depthFromTower,
  };
  const carafeBase = getIsoEllipse({
    center: { ...carafeCenter, z: position.z + COFFEE_CARAFE.bottom },
    radius: COFFEE_CARAFE.radius,
    projection,
  });
  const carafeTop = getIsoEllipse({
    center: { ...carafeCenter, z: position.z + COFFEE_CARAFE.top },
    radius: COFFEE_CARAFE.radius,
    projection,
  });
  const flask: ScreenPoint[] = [
    { x: carafeTop.cx - carafeTop.rx, y: carafeTop.cy },
    { x: carafeTop.cx, y: carafeTop.cy - carafeTop.ry },
    { x: carafeTop.cx + carafeTop.rx, y: carafeTop.cy },
    { x: carafeBase.cx + carafeBase.rx, y: carafeBase.cy },
    { x: carafeBase.cx, y: carafeBase.cy + carafeBase.ry },
    { x: carafeBase.cx - carafeBase.rx, y: carafeBase.cy },
  ];

  return {
    baseHeight: BASE_HEIGHT,
    transform: plane.transform,
    rects,
    controlOutlines: { switch: plane.toOutline(rects.switch), flask },
  };
}
