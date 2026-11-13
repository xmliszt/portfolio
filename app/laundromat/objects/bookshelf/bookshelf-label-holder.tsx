import type { BookshelfRow } from "@/lib/laundromat/bookshelf/bookshelf-row";
import { getBookshelfLabelHolder } from "@/lib/laundromat/bookshelf/get-bookshelf-label-holder";
import { getFacePlane } from "@/lib/laundromat/get-face-plane";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import { projectIsoPoint } from "@/lib/laundromat/project-iso-point";
import type { IsoPoint, IsoSize } from "@/lib/laundromat/scene-config";
import { toSvgPoints } from "@/lib/laundromat/to-svg-points";

type BookshelfLabelHolderProps = {
  row: BookshelfRow;
  position: IsoPoint;
  size: IsoSize;
  text: string;
  hasPrevious: boolean;
  hasNext: boolean;
  projection: IsoProjection;
};

export function BookshelfLabelHolder(props: BookshelfLabelHolderProps) {
  const { projection } = props;
  const unit = projection.unit;
  const k = unit / 100;
  const holder = getBookshelfLabelHolder(props);
  const { plate, y } = holder;
  function at(x: number, yy: number, z: number) {
    return projectIsoPoint({ point: { x, y: yy, z }, projection });
  }
  const face = getFacePlane({
    plane: "front",
    origin: { x: plate.x0, y: y + 0.012, z: plate.z1 },
    projection,
  });
  const width = (plate.x1 - plate.x0) * unit;
  const height = (plate.z1 - plate.z0) * unit;
  function screw(cx: number) {
    return (
      <g key={cx}>
        <circle
          cx={cx}
          cy={height / 2}
          r={1.1 * k}
          className="fill-[var(--lm-face-top)]"
          strokeWidth={0.5}
        />
        <line
          x1={cx - 0.66 * k}
          y1={height / 2}
          x2={cx + 0.66 * k}
          y2={height / 2}
          strokeWidth={0.45}
        />
      </g>
    );
  }
  function arrow(side: "previous" | "next", enabled: boolean) {
    const tab = holder[side];
    const tabFace = getFacePlane({
      plane: "front",
      origin: { x: tab.x0, y: y + 0.012, z: tab.z1 },
      projection,
    });
    const size = (tab.x1 - tab.x0) * unit;
    const tip = side === "previous" ? size * 0.32 : size * 0.68;
    const tail = side === "previous" ? size * 0.62 : size * 0.38;
    return (
      <g transform={tabFace.transform} opacity={enabled ? 1 : 0.3}>
        <rect
          width={size}
          height={size}
          rx={2 * k}
          className="fill-[var(--lm-face-top)]"
          strokeWidth={0.6}
        />
        <path
          d={`M${tail},${size * 0.24} L${tip},${size / 2} L${tail},${size * 0.76} Z`}
          className="fill-[var(--lm-detail)] stroke-none"
        />
      </g>
    );
  }
  return (
    <g strokeWidth={0.7}>
      <polygon
        className="fill-[var(--lm-face-top)]"
        points={toSvgPoints([
          at(plate.x0, y - 0.014, plate.z1),
          at(plate.x1, y - 0.014, plate.z1),
          at(plate.x1, y + 0.012, plate.z1),
          at(plate.x0, y + 0.012, plate.z1),
        ])}
      />
      <polygon
        className="fill-[var(--lm-shade-2)]"
        points={toSvgPoints([
          at(plate.x1, y - 0.014, plate.z0),
          at(plate.x1, y + 0.012, plate.z0),
          at(plate.x1, y + 0.012, plate.z1),
          at(plate.x1, y - 0.014, plate.z1),
        ])}
      />
      <g transform={face.transform}>
        <rect
          width={width}
          height={height}
          rx={1.2 * k}
          className="fill-[var(--lm-face-top)]"
        />
        <rect
          x={6 * k}
          y={3 * k}
          width={width - 12 * k}
          height={height - 6 * k}
          rx={0.8 * k}
          className="fill-[var(--lm-paper)] stroke-[var(--lm-detail)]"
          fillOpacity={0.2}
          strokeWidth={0.5}
        />
        {screw(3 * k)}
        {screw(width - 3 * k)}
        <text
          x={width / 2}
          y={height / 2 + 0.4 * k}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={6.8 * k}
          letterSpacing={0.7 * k}
          className="fill-[var(--lm-ink)] stroke-none font-[family-name:var(--lm-font-mono)]"
        >
          {props.text}
        </text>
      </g>
      {arrow("previous", props.hasPrevious)}
      {arrow("next", props.hasNext)}
    </g>
  );
}
