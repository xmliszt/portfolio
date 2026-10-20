import type { LaidOutObject } from "@/lib/laundromat/build-scene-layout";
import { getIsoCylinder } from "@/lib/laundromat/get-iso-cylinder";
import { getIsoEllipse } from "@/lib/laundromat/get-iso-ellipse";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";

import { CylinderSides } from "./cylinder-sides";
import { partStroke } from "./part-stroke";

const BASE_HEIGHT = 0.06;
const NECK = { height: 0.08, radiusRatio: 0.8 };
const LID_HEIGHT = 0.07;
const COIN_RADIUS = 0.06;
const COIN_LAYER = 0.045;
const TOP_COINS = [
  { u: -0.45, v: 0.1 },
  { u: 0.05, v: -0.35 },
  { u: 0.4, v: 0.2 },
  { u: -0.05, v: 0.45 },
  { u: 0.5, v: -0.25 },
];

type TipJarDrawingProps = {
  laidOut: LaidOutObject;
  projection: IsoProjection;
  highlighted: boolean;
  fillRatio: number;
};

export function TipJarDrawing(props: TipJarDrawingProps) {
  const { position: p, size } = props.laidOut.object;
  const { projection } = props;
  const center = { x: p.x + size.w / 2, y: p.y + size.d / 2 };
  const radius = Math.min(size.w, size.d) * 0.42;
  const glassBottom = p.z + BASE_HEIGHT;
  const shoulder = p.z + size.h - LID_HEIGHT - NECK.height;
  const neckRadius = radius * NECK.radiusRatio;
  const coinTop = glassBottom + (shoulder - glassBottom) * props.fillRatio;
  const base = getIsoCylinder({
    center,
    bottom: p.z,
    top: glassBottom,
    radius: radius * 1.04,
    projection,
  });
  const glass = getIsoCylinder({
    center,
    bottom: glassBottom,
    top: shoulder,
    radius,
    projection,
  });
  const coins = getIsoCylinder({
    center,
    bottom: glassBottom,
    top: coinTop,
    radius: radius * 0.94,
    projection,
  });
  const neck = getIsoCylinder({
    center,
    bottom: shoulder,
    top: shoulder + NECK.height,
    radius: neckRadius,
    projection,
  });
  const lid = getIsoCylinder({
    center,
    bottom: shoulder + NECK.height,
    top: p.z + size.h,
    radius: neckRadius * 1.08,
    projection,
  });
  const slotHalf = neckRadius * 0.5 * projection.unit;
  const glint = {
    x: glass.top.cx - glass.top.rx * 0.55,
    top: glass.top.cy + 3,
    bottom: glass.base.cy - 3,
  };
  return (
    <g className={partStroke(props.highlighted)} strokeLinejoin="round">
      <CylinderSides body={base.body} facets={base.facets} />
      <ellipse {...base.top} className="fill-[var(--lm-face-top)]" />
      <path
        d={glass.body}
        className="fill-[var(--lm-recess)] stroke-none"
        opacity={0.55}
      />
      {props.fillRatio > 0 && (
        <g className="stroke-[var(--lm-accent)]" strokeWidth={0.5}>
          <path
            d={coins.body}
            className="fill-[var(--lm-accent)] stroke-none"
            opacity={0.14}
          />
          {Array.from(
            { length: Math.floor((coinTop - glassBottom) / COIN_LAYER) },
            (_, index) => {
              const layer = getIsoEllipse({
                center: {
                  ...center,
                  z: glassBottom + (index + 1) * COIN_LAYER,
                },
                radius: radius * 0.94,
                projection,
              });
              return (
                <path
                  key={index}
                  d={`M ${layer.cx - layer.rx} ${layer.cy} A ${layer.rx} ${layer.ry} 0 0 0 ${layer.cx + layer.rx} ${layer.cy}`}
                  className="fill-none"
                  opacity={0.55}
                />
              );
            }
          )}
          <ellipse
            {...coins.top}
            className="fill-[var(--lm-recess)]"
            opacity={0.9}
          />
          {TOP_COINS.map((coin) => {
            const ellipse = getIsoEllipse({
              center: {
                x: center.x + coin.u * radius * 0.7,
                y: center.y + coin.v * radius * 0.7,
                z: coinTop + 0.01,
              },
              radius: COIN_RADIUS,
              projection,
            });
            return (
              <ellipse
                key={`${coin.u}-${coin.v}`}
                {...ellipse}
                className="fill-[var(--lm-accent)]"
                opacity={0.8}
              />
            );
          })}
        </g>
      )}
      <path d={glass.body} className="fill-none" strokeWidth={0.75} />
      <line
        x1={glint.x}
        y1={glint.top}
        x2={glint.x}
        y2={glint.bottom}
        className="stroke-[var(--lm-ink-hi)]"
        strokeWidth={0.75}
        strokeLinecap="round"
        opacity={0.5}
      />
      <ellipse
        {...glass.top}
        className="fill-none stroke-[var(--lm-detail)]"
        strokeWidth={0.5}
      />
      <CylinderSides body={neck.body} facets={neck.facets} />
      <CylinderSides body={lid.body} facets={lid.facets} />
      <ellipse {...lid.top} className="fill-[var(--lm-face-top)]" />
      <line
        x1={lid.top.cx - slotHalf}
        y1={lid.top.cy}
        x2={lid.top.cx + slotHalf}
        y2={lid.top.cy}
        className="stroke-[var(--lm-recess)]"
        strokeWidth={1.4}
        strokeLinecap="round"
      />
    </g>
  );
}
