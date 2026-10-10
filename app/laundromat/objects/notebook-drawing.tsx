import type { LaidOutObject } from "@/lib/laundromat/build-scene-layout";
import { getFacePlane } from "@/lib/laundromat/get-face-plane";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import { projectIsoPoint } from "@/lib/laundromat/project-iso-point";
import { toSvgPoints } from "@/lib/laundromat/to-svg-points";

import { partStroke } from "./part-stroke";

const COVER = 0.022;
const PAGE_LINES = [0.3, 0.5, 0.7];

type NotebookDrawingProps = {
  laidOut: LaidOutObject;
  projection: IsoProjection;
  highlighted: boolean;
  coverNumber: number;
};

export function NotebookDrawing(props: NotebookDrawingProps) {
  const { position: p, size } = props.laidOut.object;
  const { faces } = props.laidOut;
  const { projection } = props;
  const { unit } = projection;
  function at(x: number, y: number, z: number) {
    return projectIsoPoint({ point: { x, y, z }, projection });
  }
  const top = getFacePlane({
    plane: "top",
    origin: { x: p.x, y: p.y, z: p.z + size.h },
    projection,
  });
  const front = getFacePlane({
    plane: "front",
    origin: { x: p.x, y: p.y + size.d, z: p.z + size.h },
    projection,
  });
  const side = getFacePlane({
    plane: "side",
    origin: { x: p.x + size.w, y: p.y + size.d, z: p.z + size.h },
    projection,
  });
  const width = size.w * unit;
  const depth = size.d * unit;
  const thickness = size.h * unit;
  const cover = COVER * unit;
  const ribbonX = p.x + size.w * 0.68;
  const ribbon = [
    at(ribbonX, p.y + size.d, p.z + size.h * 0.5),
    at(ribbonX + 0.04, p.y + size.d, p.z + size.h * 0.5),
    at(ribbonX + 0.1, p.y + size.d + 0.2, p.z),
    at(ribbonX + 0.05, p.y + size.d + 0.22, p.z),
  ];
  const penFrom = { x: p.x + size.w + 0.12, y: p.y + 0.06 };
  const penTo = { x: p.x + size.w + 0.24, y: p.y + size.d - 0.02 };
  const pen = [
    at(penFrom.x, penFrom.y, p.z + 0.03),
    at(penTo.x, penTo.y, p.z + 0.03),
  ];
  return (
    <g
      className={partStroke(props.highlighted)}
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <line
        x1={pen[0].x}
        y1={pen[0].y}
        x2={pen[1].x}
        y2={pen[1].y}
        strokeWidth={2.5}
      />
      <line
        x1={pen[0].x}
        y1={pen[0].y}
        x2={pen[1].x}
        y2={pen[1].y}
        className="stroke-[var(--lm-face)]"
        strokeWidth={1}
      />
      <polygon
        className="fill-[var(--lm-face)]"
        points={toSvgPoints(faces.front)}
      />
      <polygon
        className="fill-[var(--lm-wall)]"
        points={toSvgPoints(faces.side)}
      />
      <g transform={front.transform} strokeWidth={0.5}>
        <rect
          x={0.6}
          y={cover}
          width={width - 1.2}
          height={thickness - 2 * cover}
          className="fill-[var(--lm-paper)] stroke-none"
          opacity={0.18}
        />
        {PAGE_LINES.map((line) => (
          <line
            key={line}
            x1={1}
            y1={thickness * line}
            x2={width - 1}
            y2={thickness * line}
            className="stroke-[var(--lm-detail)]"
          />
        ))}
      </g>
      <g transform={side.transform} strokeWidth={0.5}>
        <rect
          x={0}
          y={cover}
          width={depth - 0.6}
          height={thickness - 2 * cover}
          className="fill-[var(--lm-paper)] stroke-none"
          opacity={0.12}
        />
      </g>
      <polygon
        className="fill-[var(--lm-face-top)]"
        points={toSvgPoints(faces.top)}
      />
      <g transform={top.transform}>
        <rect
          x={2}
          y={2}
          width={width - 4}
          height={depth - 4}
          rx={2}
          className="fill-none stroke-[var(--lm-detail)]"
          strokeWidth={0.75}
        />
        <line
          x1={3.5}
          y1={0}
          x2={3.5}
          y2={depth}
          className="stroke-[var(--lm-detail)]"
          strokeWidth={0.75}
        />
        <text
          x={width / 2 + 2}
          y={depth / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={6}
          className="fill-[var(--lm-ink)] stroke-none font-[family-name:var(--lm-font-display)]"
        >
          {`No. ${props.coverNumber}`}
        </text>
      </g>
      <polygon
        className="fill-[var(--lm-face-top)]"
        strokeWidth={0.75}
        points={toSvgPoints(ribbon)}
      />
    </g>
  );
}
