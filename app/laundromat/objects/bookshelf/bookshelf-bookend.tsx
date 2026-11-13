import type { BookshelfRow } from "@/lib/laundromat/bookshelf/bookshelf-row";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import { projectIsoPoint } from "@/lib/laundromat/project-iso-point";

import { ShadedBox } from "./shaded-box";

const DEPTH = 0.46;
const BACK_FROM_FRONT = 0.62;
const UPRIGHT_HEIGHT = 0.5;
const THICKNESS = 0.022;
const BASE_REACH = 0.26;

type BookshelfBookendProps = {
  row: BookshelfRow;
  x: number;
  part: "base" | "upright";
  projection: IsoProjection;
};

export function BookshelfBookend(props: BookshelfBookendProps) {
  const { row, x, projection } = props;
  const y0 = row.frontY - BACK_FROM_FRONT;
  if (props.part === "base") {
    return (
      <ShadedBox
        position={{ x: x - BASE_REACH, y: y0, z: row.floorZ }}
        size={{ w: BASE_REACH + THICKNESS, d: DEPTH, h: 0.008 }}
        projection={projection}
      />
    );
  }
  const from = projectIsoPoint({
    point: { x: x + THICKNESS, y: y0 + DEPTH - 0.05, z: row.floorZ },
    projection,
  });
  const to = projectIsoPoint({
    point: {
      x: x + THICKNESS,
      y: y0 + DEPTH - 0.05,
      z: row.floorZ + UPRIGHT_HEIGHT,
    },
    projection,
  });
  return (
    <g>
      <ShadedBox
        position={{ x, y: y0, z: row.floorZ }}
        size={{ w: THICKNESS, d: DEPTH, h: UPRIGHT_HEIGHT }}
        projection={projection}
        side="var(--lm-shade-2)"
      />
      <line
        className="stroke-[var(--lm-detail)]"
        strokeWidth={0.45}
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
      />
    </g>
  );
}
