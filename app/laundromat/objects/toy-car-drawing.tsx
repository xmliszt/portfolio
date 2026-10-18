import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import { toSvgPoints } from "@/lib/laundromat/to-svg-points";
import { projectToyCar } from "@/lib/laundromat/toy/project-toy-car";
import { TOY_CAR_MESH } from "@/lib/laundromat/toy/toy-car-mesh";
import type { ToyCarPose } from "@/lib/laundromat/toy/toy-car-pose";

import { partStroke } from "./part-stroke";
import { toyCarFaceClass } from "./toy-car-face-class";

type ToyCarDrawingProps = {
  pose: ToyCarPose;
  projection: IsoProjection;
  highlighted: boolean;
};

/** Draw the toy roadster at `pose` with one polygon per mesh face, outlined bright when `highlighted`. */
export function ToyCarDrawing(props: ToyCarDrawingProps) {
  const faces = projectToyCar({
    pose: props.pose,
    projection: props.projection,
  });
  const shown = new Set(faces.map((face) => face.index));
  const hidden = TOY_CAR_MESH.flatMap((face, index) =>
    shown.has(index) ? [] : [{ index, part: face.part }]
  );
  return (
    <g data-toy-car className={partStroke(props.highlighted)} strokeWidth={0.4}>
      {faces.map((face) => (
        <polygon
          key={face.index}
          data-toy-face={face.index}
          points={toSvgPoints(face.points)}
          className={toyCarFaceClass({ part: face.part, tone: face.tone })}
        />
      ))}
      {hidden.map((face) => (
        <polygon key={face.index} data-toy-face={face.index} display="none" />
      ))}
    </g>
  );
}
