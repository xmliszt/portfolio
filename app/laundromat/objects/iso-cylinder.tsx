import { getIsoCylinder } from "@/lib/laundromat/get-iso-cylinder";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";

type IsoCylinderProps = {
  center: { x: number; y: number };
  bottom: number;
  top: number;
  radius: number;
  topRadius?: number;
  projection: IsoProjection;
  bodyClassName?: string;
  topClassName?: string;
};

export function IsoCylinder(props: IsoCylinderProps) {
  const { top, body } = getIsoCylinder(props);
  return (
    <g>
      <path
        className={props.bodyClassName ?? "fill-[var(--lm-face)]"}
        d={body}
      />
      <ellipse
        className={props.topClassName ?? "fill-[var(--lm-face-top)]"}
        cx={top.cx}
        cy={top.cy}
        rx={top.rx}
        ry={top.ry}
      />
    </g>
  );
}
