import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import { toSvgPoints } from "@/lib/laundromat/to-svg-points";
import { projectToyCar } from "@/lib/laundromat/toy/project-toy-car";
import type { ToyCarPose } from "@/lib/laundromat/toy/toy-car-pose";

import { toyCarFaceClass } from "./toy-car-face-class";

/** Redraw the face polygons under `group` (one `[data-toy-face]` per mesh face) for the car at `pose`: visible faces get their points, fill and back-to-front order; the rest are hidden. */
export function paintToyCar(options: {
  group: SVGGElement;
  pose: ToyCarPose;
  projection: IsoProjection;
}) {
  const { group } = options;
  const polygons: { [index: string]: SVGPolygonElement } = Object.fromEntries(
    Array.from(
      group.querySelectorAll<SVGPolygonElement>("[data-toy-face]")
    ).map((polygon) => [polygon.dataset.toyFace, polygon])
  );
  const faces = projectToyCar({
    pose: options.pose,
    projection: options.projection,
  });
  const shown = new Set(faces.map((face) => String(face.index)));
  Object.entries(polygons).forEach(([index, polygon]) => {
    if (!shown.has(index)) polygon.setAttribute("display", "none");
  });
  faces.forEach((face) => {
    const polygon = polygons[face.index];
    if (polygon === undefined) return;
    polygon.removeAttribute("display");
    polygon.setAttribute("points", toSvgPoints(face.points));
    polygon.setAttribute(
      "class",
      toyCarFaceClass({ part: face.part, tone: face.tone })
    );
    group.appendChild(polygon);
  });
}
