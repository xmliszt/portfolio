import { useTickingNow } from "@/app/laundromat/use-ticking-now";
import type { LaidOutObject } from "@/lib/laundromat/build-scene-layout";
import type { CoffeePhase } from "@/lib/laundromat/coffee/get-coffee-phase";
import {
  COFFEE_CARAFE,
  COFFEE_FOOT_HEIGHT,
  COFFEE_TOWER_DEPTH,
} from "@/lib/laundromat/get-coffee-machine-face";
import { getFacePlane } from "@/lib/laundromat/get-face-plane";
import { getIsoCylinder } from "@/lib/laundromat/get-iso-cylinder";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import { projectIsoPoint } from "@/lib/laundromat/project-iso-point";
import type { SceneConfig } from "@/lib/laundromat/scene-config";
import { cn } from "@/lib/utils";

import { CylinderSides } from "./cylinder-sides";
import { IsoBox } from "./iso-box";
import { IsoCylinder } from "./iso-cylinder";
import { partStroke } from "./part-stroke";
import { SteamWisps } from "./steam-wisps";

const HEAD_HEIGHT = 0.36;
const HEAD_DEPTH = 0.56;
const HEAD_INSET = 0.08;
const FOOT_INSET = 0.09;
const FOOT_RADIUS = 0.06;
const PLATE_HEIGHT = 0.025;
const COLLAR_HEIGHT = 0.1;
const LID = { inset: 0.08, height: 0.03 };
const KNOB = { radius: 0.06, height: 0.05 };
const SEAM_FROM_BOTTOM = 0.07;
const GAUGE_SWEEP_DEG = 55;
const GAUGE_TICKS = [-1, -0.67, -0.33, 0, 0.33, 0.67, 1];
const VENT_SLOTS = [0.24, 0.29, 0.34];
const STREAM_DASH = "6 0.8";

const BREW_FRAME_MS = 100;

type CoffeeMachineDrawingProps = {
  laidOut: LaidOutObject;
  projection: IsoProjection;
  highlightedId: string | undefined;
  phase: CoffeePhase;
  details: SceneConfig["details"]["coffee"];
};

export function CoffeeMachineDrawing(props: CoffeeMachineDrawingProps) {
  const drawNow = useTickingNow({
    active: props.phase.kind === "brewing",
    intervalMs: BREW_FRAME_MS,
  });
  const { object, face } = props.laidOut;
  if (face?.target !== "coffee") return null;
  const { projection, phase, details } = props;
  const { position: p, size } = object;
  const { unit } = projection;
  const isHighlighted = props.highlightedId === object.id;
  const isSwitchHighlighted = props.highlightedId === `${object.id}-switch`;
  const isFlaskHighlighted = props.highlightedId === `${object.id}-flask`;
  const isLive =
    phase.kind === "brewing" || (phase.kind === "ready" && phase.hot);
  const fill = (() => {
    switch (phase.kind) {
      case "empty":
        return 0;
      case "ready":
        return phase.level;
      case "brewing": {
        const brewMs = details.brewSeconds * 1000;
        const levelNow = 1 - (phase.doneAt - drawNow) / brewMs;
        return Math.min(1, Math.max(phase.level, levelNow));
      }
      default: {
        const unhandled: never = phase;
        return unhandled;
      }
    }
  })();
  const baseTop = p.z + face.baseHeight;
  const top = p.z + size.h;
  const headBottom = top - HEAD_HEIGHT;
  const headFront = p.y + COFFEE_TOWER_DEPTH + HEAD_DEPTH;
  const carafeCenter = {
    x: p.x + size.w / 2,
    y: p.y + COFFEE_TOWER_DEPTH + COFFEE_CARAFE.depthFromTower,
  };
  const carafeBottom = p.z + COFFEE_CARAFE.bottom;
  const carafeTop = p.z + COFFEE_CARAFE.top;
  const collarBottom = carafeTop - COLLAR_HEIGHT;
  const collarRadius =
    COFFEE_CARAFE.topRadius +
    ((COFFEE_CARAFE.radius - COFFEE_CARAFE.topRadius) * COLLAR_HEIGHT) /
      (carafeTop - carafeBottom);
  const liquidTop =
    carafeBottom + 0.04 + (collarBottom - carafeBottom - 0.08) * fill;
  const liquid = getIsoCylinder({
    center: carafeCenter,
    bottom: carafeBottom + 0.03,
    top: liquidTop,
    radius: COFFEE_CARAFE.radius - 0.03,
    topRadius:
      COFFEE_CARAFE.radius -
      0.03 -
      (COFFEE_CARAFE.radius - collarRadius) *
        ((liquidTop - carafeBottom) / (collarBottom - carafeBottom)),
    projection,
  });
  const glass = getIsoCylinder({
    center: carafeCenter,
    bottom: carafeBottom,
    top: collarBottom,
    radius: COFFEE_CARAFE.radius,
    topRadius: collarRadius,
    projection,
  });
  const collar = getIsoCylinder({
    center: carafeCenter,
    bottom: collarBottom,
    top: carafeTop,
    radius: collarRadius,
    topRadius: COFFEE_CARAFE.topRadius,
    projection,
  });
  const streamTop = projectIsoPoint({
    point: { ...carafeCenter, z: headBottom },
    projection,
  });
  const feet = [
    { x: p.x + FOOT_INSET, y: p.y + FOOT_INSET },
    { x: p.x + size.w - FOOT_INSET, y: p.y + FOOT_INSET },
    { x: p.x + FOOT_INSET, y: p.y + size.d - FOOT_INSET },
    { x: p.x + size.w - FOOT_INSET, y: p.y + size.d - FOOT_INSET },
  ];

  const baseHeightPx = (face.baseHeight - COFFEE_FOOT_HEIGHT) * unit;
  const baseSide = getFacePlane({
    plane: "side",
    origin: { x: p.x + size.w, y: p.y + size.d, z: baseTop },
    projection,
  });
  const towerSide = getFacePlane({
    plane: "side",
    origin: { x: p.x + size.w, y: p.y + COFFEE_TOWER_DEPTH, z: top },
    projection,
  });
  const towerSideWidth = COFFEE_TOWER_DEPTH * unit;
  const towerHeightPx = (top - baseTop) * unit;
  const waterWindow = {
    x: 0.07 * unit,
    y: (HEAD_HEIGHT + 0.12) * unit,
    width: 0.1 * unit,
    height: towerHeightPx - (HEAD_HEIGHT + 0.42) * unit,
  };
  const waterLine = waterWindow.y + waterWindow.height * (0.15 + 0.75 * fill);
  const vent = {
    y: towerHeightPx - 0.36 * unit,
    width: 0.025 * unit,
    height: 0.24 * unit,
  };
  const headFrontPlane = getFacePlane({
    plane: "front",
    origin: { x: p.x + HEAD_INSET, y: headFront, z: top },
    projection,
  });
  const headSidePlane = getFacePlane({
    plane: "side",
    origin: { x: p.x + size.w - HEAD_INSET, y: headFront, z: top },
    projection,
  });
  const headWidthPx = (size.w - 2 * HEAD_INSET) * unit;
  const headHeightPx = HEAD_HEIGHT * unit;
  const headSeamY = headHeightPx - SEAM_FROM_BOTTOM * unit;
  const gauge = { x: 0.22 * unit, y: headSeamY / 2, r: 0.1 * unit };
  const buttons = [headWidthPx - 0.18 * unit, headWidthPx - 0.32 * unit];
  const screwRadius = 0.012 * unit;
  const handleX = collar.top.cx + collar.top.rx;
  const streamStyle: React.CSSProperties = {
    animation: `lm-stream ${details.streamFlowMs}ms linear infinite`,
  };
  const { switch: switchRect } = face.rects;

  return (
    <g data-coffee={phase.kind} strokeLinejoin="round">
      <g className="stroke-[var(--lm-line)]">
        {feet.map((foot) => (
          <IsoCylinder
            key={`${foot.x},${foot.y}`}
            center={foot}
            bottom={p.z}
            top={p.z + COFFEE_FOOT_HEIGHT}
            radius={FOOT_RADIUS}
            projection={projection}
          />
        ))}
      </g>
      <g className={partStroke(isHighlighted)}>
        <IsoBox
          position={{ x: p.x, y: p.y, z: p.z + COFFEE_FOOT_HEIGHT }}
          size={{
            w: size.w,
            d: size.d,
            h: face.baseHeight - COFFEE_FOOT_HEIGHT,
          }}
          projection={projection}
        />
      </g>
      <g className="stroke-[var(--lm-detail)]" strokeWidth={0.75}>
        <line
          transform={face.transform}
          x1={0}
          y1={baseHeightPx - SEAM_FROM_BOTTOM * unit}
          x2={size.w * unit}
          y2={baseHeightPx - SEAM_FROM_BOTTOM * unit}
        />
        <line
          transform={baseSide.transform}
          x1={0}
          y1={baseHeightPx - SEAM_FROM_BOTTOM * unit}
          x2={size.d * unit}
          y2={baseHeightPx - SEAM_FROM_BOTTOM * unit}
        />
      </g>
      <g className={partStroke(isHighlighted)}>
        <IsoCylinder
          center={carafeCenter}
          bottom={baseTop}
          top={baseTop + PLATE_HEIGHT}
          radius={COFFEE_CARAFE.radius + 0.06}
          projection={projection}
          topClassName={cn(
            "fill-[var(--lm-recess)]",
            isLive && "stroke-[var(--lm-accent)]"
          )}
        />
        <IsoBox
          position={{ x: p.x, y: p.y, z: baseTop }}
          size={{ w: size.w, d: COFFEE_TOWER_DEPTH, h: top - baseTop }}
          projection={projection}
        />
      </g>
      <g transform={towerSide.transform} strokeWidth={0.75}>
        <rect
          {...waterWindow}
          rx={0.04 * unit}
          className="fill-[var(--lm-recess)] stroke-[var(--lm-line)]"
        />
        <line
          x1={waterWindow.x + 1}
          y1={waterLine}
          x2={waterWindow.x + waterWindow.width - 1}
          y2={waterLine}
          className="stroke-[var(--lm-ink)]"
        />
        {[0.2, 0.4, 0.6, 0.8].map((at, index) => (
          <line
            key={at}
            x1={waterWindow.x + waterWindow.width}
            y1={waterWindow.y + waterWindow.height * at}
            x2={
              waterWindow.x +
              waterWindow.width +
              (index % 2 === 0 ? 0.05 : 0.03) * unit
            }
            y2={waterWindow.y + waterWindow.height * at}
            className={
              index % 2 === 0
                ? "stroke-[var(--lm-line)]"
                : "stroke-[var(--lm-detail)]"
            }
          />
        ))}
        {VENT_SLOTS.map((at) => (
          <rect
            key={at}
            x={at * unit}
            y={vent.y}
            width={vent.width}
            height={vent.height}
            rx={vent.width / 2}
            className="fill-[var(--lm-recess)] stroke-[var(--lm-detail)]"
          />
        ))}
        {[0.05, towerSideWidth / unit - 0.05].map((at) => (
          <circle
            key={at}
            cx={at * unit}
            cy={(HEAD_HEIGHT + 0.06) * unit}
            r={screwRadius}
            className="fill-[var(--lm-detail)] stroke-[var(--lm-line)]"
            strokeWidth={0.4}
          />
        ))}
      </g>
      <g className={partStroke(isHighlighted)}>
        <IsoBox
          position={{ x: p.x + LID.inset, y: p.y + LID.inset, z: top }}
          size={{
            w: size.w - 2 * LID.inset,
            d: COFFEE_TOWER_DEPTH - 2 * LID.inset,
            h: LID.height,
          }}
          projection={projection}
          bevel={false}
        />
        <IsoCylinder
          center={{
            x: p.x + size.w - 0.3,
            y: p.y + COFFEE_TOWER_DEPTH / 2,
          }}
          bottom={top + LID.height}
          top={top + LID.height + KNOB.height}
          radius={KNOB.radius}
          projection={projection}
        />
      </g>
      <g className={partStroke(isHighlighted || isFlaskHighlighted)}>
        {fill > 0 && (
          <g className="stroke-[var(--lm-detail)]" strokeWidth={0.75}>
            <path d={liquid.body} className="fill-[var(--lm-detail)]" />
            <ellipse {...liquid.top} className="fill-[var(--lm-recess)]" />
          </g>
        )}
        {phase.kind === "brewing" && (
          <line
            data-lm-motion
            x1={collar.top.cx}
            y1={glass.top.cy}
            x2={collar.top.cx}
            y2={liquid.top.cy}
            className="stroke-[var(--lm-accent)]"
            strokeWidth={1.2}
            strokeLinecap="round"
            strokeDasharray={STREAM_DASH}
            style={streamStyle}
          />
        )}
        <path
          d={glass.body}
          className="fill-[var(--lm-ink-hi)]"
          fillOpacity={0.04}
        />
        {[0.3, 0.5, 0.7].map((at) => (
          <line
            key={at}
            x1={glass.base.cx - glass.base.rx * 0.55}
            y1={glass.base.cy + (glass.top.cy - glass.base.cy) * at}
            x2={glass.base.cx - glass.base.rx * 0.35}
            y2={glass.base.cy + (glass.top.cy - glass.base.cy) * at + 0.6}
            className="stroke-[var(--lm-detail)]"
            strokeWidth={0.6}
          />
        ))}
        <line
          x1={glass.base.cx - glass.base.rx + 3}
          y1={glass.base.cy - 4}
          x2={glass.top.cx - glass.top.rx + 2}
          y2={glass.top.cy + 3}
          className="stroke-[var(--lm-ink-hi)]"
          strokeOpacity={0.15}
        />
        <CylinderSides body={collar.body} facets={collar.facets} />
        <ellipse {...collar.top} className="fill-[var(--lm-face-top)]" />
        <ellipse
          cx={collar.top.cx}
          cy={collar.top.cy}
          rx={collar.top.rx * 0.45}
          ry={collar.top.ry * 0.45}
          className="fill-[var(--lm-recess)] stroke-[var(--lm-detail)]"
          strokeWidth={0.75}
        />
        <path
          d={`M ${handleX - 1} ${collar.top.cy + 2} C ${handleX + 8} ${collar.top.cy + 1} ${handleX + 8} ${glass.base.cy - 6} ${handleX - 1} ${glass.base.cy - 5}`}
          className="fill-none"
          strokeWidth={1.75}
        />
      </g>
      <g className={partStroke(isHighlighted)}>
        {phase.kind === "brewing" && (
          <line
            data-lm-motion
            x1={streamTop.x}
            y1={streamTop.y}
            x2={collar.top.cx}
            y2={collar.top.cy}
            className="stroke-[var(--lm-accent)]"
            strokeWidth={1.2}
            strokeLinecap="round"
            strokeDasharray={STREAM_DASH}
            style={streamStyle}
          />
        )}
        <IsoBox
          position={{
            x: p.x + HEAD_INSET,
            y: p.y + COFFEE_TOWER_DEPTH,
            z: headBottom,
          }}
          size={{ w: size.w - 2 * HEAD_INSET, d: HEAD_DEPTH, h: HEAD_HEIGHT }}
          projection={projection}
        />
      </g>
      <g strokeWidth={0.75}>
        <line
          transform={headFrontPlane.transform}
          x1={0}
          y1={headSeamY}
          x2={headWidthPx}
          y2={headSeamY}
          className="stroke-[var(--lm-detail)]"
        />
        <line
          transform={headSidePlane.transform}
          x1={0}
          y1={headSeamY}
          x2={HEAD_DEPTH * unit}
          y2={headSeamY}
          className="stroke-[var(--lm-detail)]"
        />
        {[0.06, HEAD_DEPTH - 0.06].map((at) => (
          <circle
            key={at}
            transform={headSidePlane.transform}
            cx={at * unit}
            cy={headSeamY / 2}
            r={screwRadius}
            className="fill-[var(--lm-detail)] stroke-[var(--lm-line)]"
            strokeWidth={0.4}
          />
        ))}
        <g transform={headFrontPlane.transform}>
          <g transform={`translate(${gauge.x} ${gauge.y})`}>
            <circle
              r={gauge.r + 0.02 * unit}
              className="fill-[var(--lm-face-top)] stroke-[var(--lm-line)]"
            />
            <circle
              r={gauge.r}
              className="fill-[var(--lm-recess)] stroke-[var(--lm-detail)]"
            />
            {GAUGE_TICKS.map((at, index) => (
              <line
                key={at}
                x1={0}
                y1={-gauge.r}
                x2={0}
                y2={-gauge.r + (index % 3 === 0 ? 0.035 : 0.022) * unit}
                transform={`rotate(${at * GAUGE_SWEEP_DEG})`}
                className={
                  index % 3 === 0
                    ? "stroke-[var(--lm-line)]"
                    : "stroke-[var(--lm-detail)]"
                }
                strokeWidth={0.6}
              />
            ))}
            <line
              data-lm-motion
              x1={0}
              y1={0}
              x2={0}
              y2={-gauge.r + 0.025 * unit}
              className={
                isLive ? "stroke-[var(--lm-accent)]" : "stroke-[var(--lm-ink)]"
              }
              strokeLinecap="round"
              style={{
                transform: `rotate(${(isLive ? 0.75 : -1) * GAUGE_SWEEP_DEG}deg)`,
                transition: "transform 1200ms cubic-bezier(0.2, 0.9, 0.3, 1)",
              }}
            />
            <circle
              r={0.018 * unit}
              className="fill-[var(--lm-ink)] stroke-none"
            />
          </g>
          {buttons.map((x) => (
            <circle
              key={x}
              cx={x}
              cy={headSeamY / 2}
              r={0.045 * unit}
              className="fill-[var(--lm-face-top)] stroke-[var(--lm-line)]"
            />
          ))}
        </g>
      </g>
      {isLive && (
        <SteamWisps
          x={collar.top.cx}
          y={collar.top.cy - 1}
          height={10}
          opacity={details.steamOpacity * 0.7}
          riseSeconds={details.steamRiseSeconds}
        />
      )}
      <g transform={face.transform} strokeWidth={0.75}>
        {isSwitchHighlighted && (
          <rect
            {...switchRect}
            rx={2}
            className="fill-none stroke-[var(--lm-ink)]"
            strokeOpacity={0.4}
          />
        )}
        <g
          transform={`translate(${switchRect.x + switchRect.width / 2} ${switchRect.y + switchRect.height / 2})`}
        >
          <rect
            x={-4}
            y={-3}
            width={8}
            height={6}
            rx={1}
            className={cn(
              "fill-[var(--lm-face-top)]",
              partStroke(isSwitchHighlighted)
            )}
          />
          <line
            x1={isLive ? -2 : 2}
            y1={-2}
            x2={isLive ? -2 : 2}
            y2={2}
            className="stroke-[var(--lm-ink)]"
          />
          <circle
            cx={-8}
            cy={0}
            r={1.2}
            className={cn(
              "stroke-none",
              isLive ? "fill-[var(--lm-accent)]" : "fill-[var(--lm-detail)]"
            )}
          />
        </g>
      </g>
    </g>
  );
}
