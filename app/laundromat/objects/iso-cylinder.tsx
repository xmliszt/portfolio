import { getIsoCylinder } from "@/lib/laundromat/get-iso-cylinder";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";

import { CylinderSides } from "./cylinder-sides";

type IsoCylinderProps = {
  center: { x: number; y: number };
  bottom: number;
  top: number;
  radius: number;
  topRadius?: number;
  projection: IsoProjection;
  topClassName?: string;
};

export function IsoCylinder(props: IsoCylinderProps) {
  const { top, body, facets } = getIsoCylinder(props);
  return (
    <g>
      <CylinderSides body={body} facets={facets} />
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
