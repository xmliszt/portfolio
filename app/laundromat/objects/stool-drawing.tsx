import type { LaidOutObject } from "@/lib/laundromat/build-scene-layout";
import { getIsoEllipse } from "@/lib/laundromat/get-iso-ellipse";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";

import { IsoCylinder } from "./iso-cylinder";
import { partStroke } from "./part-stroke";

const SEAT_THICKNESS = 0.16;
const COLUMN_RADIUS = 0.06;
const FOOTREST = { height: 0.6, radius: 0.3 };
const BASE = { radius: 0.34, height: 0.05 };

type StoolDrawingProps = {
  laidOut: LaidOutObject;
  projection: IsoProjection;
  highlighted: boolean;
};

export function StoolDrawing(props: StoolDrawingProps) {
  const { position: p, size } = props.laidOut.object;
  const { projection } = props;
  const center = { x: p.x + size.w / 2, y: p.y + size.d / 2 };
  const seatRadius = (Math.min(size.w, size.d) / 2) * 0.86;
  const seatTop = p.z + size.h;
  const ring = getIsoEllipse({
    center: { ...center, z: p.z + FOOTREST.height },
    radius: FOOTREST.radius,
    projection,
  });
  const cushion = getIsoEllipse({
    center: { ...center, z: seatTop },
    radius: seatRadius - 0.05,
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
      <path
        d={`M ${ring.cx - ring.rx} ${ring.cy} A ${ring.rx} ${ring.ry} 0 0 1 ${ring.cx + ring.rx} ${ring.cy}`}
        className="fill-none"
        strokeWidth={1.5}
      />
      <IsoCylinder
        center={center}
        bottom={p.z + BASE.height}
        top={seatTop - SEAT_THICKNESS}
        radius={COLUMN_RADIUS}
        projection={projection}
      />
      <path
        d={`M ${ring.cx - ring.rx} ${ring.cy} A ${ring.rx} ${ring.ry} 0 0 0 ${ring.cx + ring.rx} ${ring.cy}`}
        className="fill-none"
        strokeWidth={1.5}
      />
      <IsoCylinder
        center={center}
        bottom={seatTop - SEAT_THICKNESS}
        top={seatTop}
        radius={seatRadius}
        projection={projection}
      />
      <ellipse
        {...cushion}
        className="fill-none stroke-[var(--lm-detail)]"
        strokeWidth={0.75}
      />
    </g>
  );
}
