import { BoxBevel } from "@/app/laundromat/objects/box-bevel";
import { getBoxFaces } from "@/lib/laundromat/get-box-faces";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import type { IsoPoint, IsoSize } from "@/lib/laundromat/scene-config";
import { toSvgPoints } from "@/lib/laundromat/to-svg-points";

type ShadedBoxProps = {
  position: IsoPoint;
  size: IsoSize;
  projection: IsoProjection;
  front?: string;
  side?: string;
  top?: string;
  bevel?: boolean;
};

export function ShadedBox(props: ShadedBoxProps) {
  const faces = getBoxFaces({
    position: props.position,
    size: props.size,
    projection: props.projection,
  });
  return (
    <g>
      <polygon
        fill={props.top ?? "var(--lm-face-top)"}
        points={toSvgPoints(faces.top)}
      />
      <polygon
        fill={props.side ?? "var(--lm-wall)"}
        points={toSvgPoints(faces.side)}
      />
      <polygon
        fill={props.front ?? "var(--lm-face)"}
        points={toSvgPoints(faces.front)}
      />
      {props.bevel === true && <BoxBevel points={faces.bevel} />}
    </g>
  );
}
