import type { LaidOutObject } from "@/lib/laundromat/build-scene-layout";
import { getIsoCylinder } from "@/lib/laundromat/get-iso-cylinder";
import { getIsoEllipse } from "@/lib/laundromat/get-iso-ellipse";
import type { BasketContents } from "@/lib/laundromat/laundry/get-basket-contents";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";

import { partStroke } from "./part-stroke";

const WEAVE_ROWS = [0.2, 0.4, 0.6, 0.8];
const STAKES = 9;
const CRUMPLED = [
  "M -16 2 C -18 -6 -10 -10 -5 -6 C -2 -12 6 -12 8 -5 C 14 -8 19 -2 15 3 C 8 6 -8 6 -16 2 Z",
  "M -9 -4 C -7 -9 -1 -9 1 -5 M 4 -6 C 6 -9 10 -8 11 -5 M -12 0 C -9 -2 -6 -1 -4 1",
];
const WET = [
  "M -17 3 C -16 -2 -9 -4 -4 -2 C 0 -5 7 -5 10 -2 C 15 -3 18 1 16 4 C 8 6 -8 6 -17 3 Z",
  "M -8 0 C -5 -2 -1 -2 1 0 M 5 -1 C 8 -2 11 -1 12 1",
];
const FOLDED = [0, -4, -8];

type BasketDrawingProps = {
  laidOut: LaidOutObject;
  projection: IsoProjection;
  highlighted: boolean;
  contents: BasketContents;
};

export function BasketDrawing(props: BasketDrawingProps) {
  const { position: p, size } = props.laidOut.object;
  const { projection } = props;
  const center = { x: p.x + size.w / 2, y: p.y + size.d / 2 };
  const radius = Math.min(size.w, size.d) / 2;
  const bottomRadius = radius * 0.78;
  const top = p.z + size.h * 0.9;
  const body = getIsoCylinder({
    center,
    bottom: p.z,
    top,
    radius: bottomRadius,
    topRadius: radius,
    projection,
  });
  const inner = getIsoEllipse({
    center: { ...center, z: top },
    radius: radius - 0.07,
    projection,
  });
  const scale = projection.unit / 40;
  function radiusAt(ratio: number) {
    return bottomRadius + (radius - bottomRadius) * ratio;
  }
  function renderContents() {
    switch (props.contents) {
      case "empty":
        return null;
      case "dirty":
        return CRUMPLED.map((path, index) => (
          <path
            key={path}
            d={path}
            className={
              index === 0
                ? "fill-[var(--lm-face)]"
                : "fill-none stroke-[var(--lm-detail)]"
            }
          />
        ));
      case "wet":
        return WET.map((path, index) => (
          <path
            key={path}
            d={path}
            className={
              index === 0
                ? "fill-[var(--lm-recess)]"
                : "fill-none stroke-[var(--lm-detail)]"
            }
          />
        ));
      case "folded":
        return FOLDED.map((offset) => (
          <g key={offset} transform={`translate(0 ${offset})`}>
            <path
              d="M -14 0 L 0 -6 L 14 0 L 0 6 Z"
              className="fill-[var(--lm-face)]"
            />
            <path
              d="M -14 0 L -14 2 L 0 8 L 14 2 L 14 0"
              className="fill-[var(--lm-face-top)]"
            />
          </g>
        ));
      default: {
        const unhandled: never = props.contents;
        return unhandled;
      }
    }
  }
  return (
    <g
      data-basket={props.contents}
      className={partStroke(props.highlighted)}
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <path d={body.body} className="fill-[var(--lm-face)]" />
      <g className="fill-none stroke-[var(--lm-detail)]" strokeWidth={0.75}>
        {WEAVE_ROWS.map((row) => {
          const ellipse = getIsoEllipse({
            center: { ...center, z: p.z + (top - p.z) * row },
            radius: radiusAt(row),
            projection,
          });
          return (
            <path
              key={row}
              d={`M ${ellipse.cx - ellipse.rx} ${ellipse.cy} A ${ellipse.rx} ${ellipse.ry} 0 0 0 ${ellipse.cx + ellipse.rx} ${ellipse.cy}`}
            />
          );
        })}
        {Array.from({ length: STAKES }, (_, index) => {
          const angle = Math.PI * ((index + 1) / (STAKES + 1));
          const from = {
            x: body.base.cx - Math.cos(angle) * body.base.rx,
            y: body.base.cy + Math.sin(angle) * body.base.ry,
          };
          const to = {
            x: body.top.cx - Math.cos(angle) * body.top.rx,
            y: body.top.cy + Math.sin(angle) * body.top.ry,
          };
          return (
            <line key={index} x1={from.x} y1={from.y} x2={to.x} y2={to.y} />
          );
        })}
      </g>
      <ellipse {...body.top} className="fill-[var(--lm-face-top)]" />
      <ellipse
        {...inner}
        className="fill-[var(--lm-recess)] stroke-[var(--lm-detail)]"
        strokeWidth={0.75}
      />
      {[-1, 1].map((side) => (
        <ellipse
          key={side}
          cx={body.top.cx + side * body.top.rx * 0.82}
          cy={body.top.cy + 6}
          rx={4}
          ry={1.6}
          className="fill-[var(--lm-recess)]"
          strokeWidth={0.75}
        />
      ))}
      <g
        transform={`translate(${inner.cx} ${inner.cy}) scale(${scale})`}
        strokeWidth={0.75}
      >
        {renderContents()}
      </g>
    </g>
  );
}
