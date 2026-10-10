import type { FaceRect } from "./get-face-plane";
import { getFacePlane } from "./get-face-plane";
import type { IsoProjection } from "./project-iso-point";
import type { IsoPoint, IsoSize, MachineKind } from "./scene-config";

/** Return the `transform` from a machine's front-face pixels to scene pixels, the face-pixel `rects` of its parts, and each control's scene outline. */
export function getMachineFace(options: {
  kind: MachineKind;
  position: IsoPoint;
  size: IsoSize;
  projection: IsoProjection;
}) {
  const { position, size, projection } = options;
  const { unit } = projection;
  const plane = getFacePlane({
    plane: "front",
    origin: { x: position.x, y: position.y + size.d, z: position.z + size.h },
    projection,
  });
  const width = size.w * unit;
  const height = size.h * unit;
  const panel = { x: 0.04 * width, y: 0.06 * unit, height: 1.08 * unit };
  const band = {
    y: panel.y + panel.height + 0.06 * unit,
    height: (options.kind === "washer" ? 0.34 : 0.22) * unit,
  };
  const doorTop = band.y + band.height + 0.08 * unit;
  const doorSide = Math.min(width * 0.8, height - doorTop - 0.12 * unit);
  const rects = {
    panel: { ...panel, width: 0.92 * width },
    dial: { x: 0.06 * width, y: 0.1 * unit, width: 0.42 * width, height: unit },
    readout: {
      x: 0.52 * width,
      y: 0.14 * unit,
      width: 0.42 * width,
      height: 0.36 * unit,
    },
    start: {
      x: 0.52 * width,
      y: 0.56 * unit,
      width: 0.42 * width,
      height: 0.54 * unit,
    },
    band: { x: 0.04 * width, width: 0.92 * width, ...band },
    door: {
      x: (width - doorSide) / 2,
      y: doorTop,
      width: doorSide,
      height: doorSide,
    },
    body: { x: 0, y: 0, width, height },
  } satisfies { [part: string]: FaceRect };

  return {
    transform: plane.transform,
    rects,
    controlOutlines: {
      dial: plane.toOutline(rects.dial),
      start: plane.toOutline(rects.start),
      door: plane.toOutline(rects.door),
    },
  };
}
