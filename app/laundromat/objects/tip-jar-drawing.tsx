import { useId } from "react";

import type { LaidOutObject } from "@/lib/laundromat/build-scene-layout";
import { getIsoCylinder } from "@/lib/laundromat/get-iso-cylinder";
import { getIsoEllipse } from "@/lib/laundromat/get-iso-ellipse";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import { getJarCoinPile } from "@/lib/laundromat/tip/get-jar-coin-pile";
import { METAL_TONES } from "@/lib/laundromat/tip/tip-coin-metals";

import { CylinderSides } from "./cylinder-sides";
import { partStroke } from "./part-stroke";

const BASE_HEIGHT = 0.06;
const NECK = { height: 0.08, radiusRatio: 0.8 };
const LID_HEIGHT = 0.07;
const COIN_RADIUS = 0.05;
const COIN_THICKNESS_PX = 1.1;
const LAYER_HEIGHT = 0.03;
const INNER_RADIUS_RATIO = 0.9;
const MAX_TILT_SQUASH = 0.3;

type TipJarDrawingProps = {
  laidOut: LaidOutObject;
  projection: IsoProjection;
  highlighted: boolean;
  coinCount: number;
};

export function TipJarDrawing(props: TipJarDrawingProps) {
  const { position: p, size } = props.laidOut.object;
  const { projection } = props;
  const center = { x: p.x + size.w / 2, y: p.y + size.d / 2 };
  const radius = Math.min(size.w, size.d) * 0.42;
  const glassBottom = p.z + BASE_HEIGHT;
  const shoulder = p.z + size.h - LID_HEIGHT - NECK.height;
  const neckRadius = radius * NECK.radiusRatio;
  const clipId = useId();
  const glintId = useId();
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
    x: glass.top.cx - glass.top.rx * 0.62,
    top: glass.top.cy + glass.top.ry * 0.8,
    bottom: glass.base.cy + glass.base.ry * 0.6,
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
      <defs>
        <linearGradient
          id={glintId}
          gradientUnits="userSpaceOnUse"
          x1={0}
          y1={glint.top}
          x2={0}
          y2={glint.bottom}
        >
          <stop offset={0} stopColor="var(--lm-ink-hi)" stopOpacity={0} />
          <stop offset={0.3} stopColor="var(--lm-ink-hi)" stopOpacity={0.3} />
          <stop offset={0.55} stopColor="var(--lm-ink-hi)" stopOpacity={0.12} />
          <stop offset={1} stopColor="var(--lm-ink-hi)" stopOpacity={0} />
        </linearGradient>
        <clipPath id={clipId}>
          <path d={glass.body} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`} strokeWidth={0.4}>
        {getJarCoinPile(props.coinCount)
          .map((coin, pileIndex) => {
            const z = Math.min(
              glassBottom + coin.layer * LAYER_HEIGHT,
              shoulder - LAYER_HEIGHT
            );
            const face = getIsoEllipse({
              center: {
                x: center.x + coin.u * radius * INNER_RADIUS_RATIO,
                y: center.y + coin.v * radius * INNER_RADIUS_RATIO,
                z,
              },
              radius: COIN_RADIUS,
              projection,
            });
            return { coin, face, pileIndex };
          })
          .toSorted(
            (a, b) => a.coin.layer - b.coin.layer || a.face.cy - b.face.cy
          )
          .map(({ coin, face, pileIndex }) => {
            const tones = METAL_TONES[coin.metal];
            const ry =
              face.ry * (1 + (Math.abs(coin.tiltDeg) / 25) * MAX_TILT_SQUASH);
            const transform = `rotate(${coin.tiltDeg / 2} ${face.cx} ${face.cy})`;
            return (
              <g key={pileIndex} transform={transform}>
                <ellipse
                  cx={face.cx}
                  cy={face.cy + COIN_THICKNESS_PX}
                  rx={face.rx}
                  ry={ry}
                  fill={tones.edge}
                  stroke="none"
                />
                <ellipse
                  cx={face.cx}
                  cy={face.cy}
                  rx={face.rx}
                  ry={ry}
                  fill={tones.base}
                  stroke={tones.dark}
                />
                <path
                  d={`M ${face.cx - face.rx * 0.6} ${face.cy - ry * 0.2} A ${face.rx * 0.6} ${ry * 0.6} 0 0 1 ${face.cx + face.rx * 0.2} ${face.cy - ry * 0.6}`}
                  fill="none"
                  stroke={tones.light}
                  strokeWidth={0.5}
                  strokeLinecap="round"
                  opacity={0.8}
                />
              </g>
            );
          })}
      </g>
      <path
        d={glass.body}
        className="fill-[var(--lm-ink-hi)] stroke-none"
        opacity={0.04}
      />
      <path d={glass.body} className="fill-none" strokeWidth={0.75} />
      <line
        x1={glint.x}
        y1={glint.top}
        x2={glint.x}
        y2={glint.bottom}
        stroke={`url(#${glintId})`}
        strokeWidth={1.4}
        strokeLinecap="round"
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
