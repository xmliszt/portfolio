import type { LaidOutObject } from "@/lib/laundromat/build-scene-layout";
import { getIsoEllipse } from "@/lib/laundromat/get-iso-ellipse";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";

import { IsoCylinder } from "./iso-cylinder";
import { partStroke } from "./part-stroke";

const TOP_THICKNESS = 0.1;
const COLUMN_RADIUS = 0.09;
const BASE = { radius: 0.5, height: 0.07 };

type TableDrawingProps = {
  laidOut: LaidOutObject;
  projection: IsoProjection;
  highlighted: boolean;
};

export function TableDrawing(props: TableDrawingProps) {
  const { position: p, size } = props.laidOut.object;
  const { projection } = props;
  const center = { x: p.x + size.w / 2, y: p.y + size.d / 2 };
  const radius = (Math.min(size.w, size.d) / 2) * 0.96;
  const top = p.z + size.h;
  const bevel = getIsoEllipse({
    center: { ...center, z: top },
    radius: radius - 0.06,
    projection,
  });
  return (
    <g className={partStroke(props.highlighted)} strokeLinejoin="round">
      <IsoCylinder
        center={center}
        bottom={p.z}
        top={p.z + BASE.height}
        radius={BASE.radius}
        projection={projection}
      />
      <IsoCylinder
        center={center}
        bottom={p.z + BASE.height}
        top={p.z + BASE.height + 0.06}
        radius={BASE.radius * 0.4}
        topRadius={COLUMN_RADIUS + 0.03}
        projection={projection}
      />
      <IsoCylinder
        center={center}
        bottom={p.z + BASE.height}
        top={top - TOP_THICKNESS}
        radius={COLUMN_RADIUS}
        projection={projection}
      />
      <IsoCylinder
        center={center}
        bottom={top - TOP_THICKNESS}
        top={top}
        radius={radius}
        projection={projection}
      />
      <ellipse
        {...bevel}
        className="fill-none stroke-[var(--lm-detail)]"
        strokeWidth={0.75}
      />
    </g>
  );
}
