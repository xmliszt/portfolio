import { getBoxFaces } from "@/lib/laundromat/get-box-faces";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import type { IsoPoint, IsoSize } from "@/lib/laundromat/scene-config";
import { toSvgPoints } from "@/lib/laundromat/to-svg-points";

type IsoBoxProps = {
  position: IsoPoint;
  size: IsoSize;
  projection: IsoProjection;
};

export function IsoBox(props: IsoBoxProps) {
  const faces = getBoxFaces({
    position: props.position,
    size: props.size,
    projection: props.projection,
  });
  return (
    <g>
      <polygon
        className="fill-[var(--lm-face)]"
        points={toSvgPoints(faces.front)}
      />
      <polygon
        className="fill-[var(--lm-wall)]"
        points={toSvgPoints(faces.side)}
      />
      <polygon
        className="fill-[var(--lm-face-top)]"
        points={toSvgPoints(faces.top)}
      />
    </g>
  );
}
