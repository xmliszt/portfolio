import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

import type { LaidOutObject } from "@/lib/laundromat/build-scene-layout";
import { getFacePlane } from "@/lib/laundromat/get-face-plane";
import { getIsoEllipse } from "@/lib/laundromat/get-iso-ellipse";
import { getTubeDigits } from "@/lib/laundromat/get-tube-digits";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import { projectIsoPoint } from "@/lib/laundromat/project-iso-point";
import type { IsoPoint, SceneConfig } from "@/lib/laundromat/scene-config";
import { cn } from "@/lib/utils";

import { IsoBox } from "./iso-box";
import { IsoCylinder } from "./iso-cylinder";
import { partStroke } from "./part-stroke";

const TUBE_COUNT = 3;
const PLINTH_HEIGHT = 0.28;
const SOCKET_HEIGHT = 0.12;
const SOCKET_RADIUS = 0.31;
const GLASS_RADIUS = 0.26;
const GLASS_HEIGHT = 0.8;
const DOME_RATIO = 0.9;
const TIP_HEIGHT = 0.07;
const BRACKET_INSET = 0.45;
const BRACKET_DROP = 0.3;
const ROLL_STEP_MS = 55;
const MESH_COLUMNS = 5;
const SCREW_RADIUS = 0.55;
const HIGHLIGHT_OFFSET = 0.55;
const HIGHLIGHT_DOME_RISE = Math.sqrt(1 - HIGHLIGHT_OFFSET ** 2);

type TubeDisplayDrawingProps = {
  laidOut: LaidOutObject;
  projection: IsoProjection;
  highlighted: boolean;
  count: number | undefined;
  rollCount: number;
  details: SceneConfig["details"]["tubeDisplay"];
};

export function TubeDisplayDrawing(props: TubeDisplayDrawingProps) {
  const { projection, details } = props;
  const { position, size } = props.laidOut.object;
  const prefersReducedMotion = useReducedMotion();
  const [rollStep, setRollStep] = useState<number>();
  const isLit = props.count !== undefined;

  useEffect(() => {
    if (props.count === undefined || prefersReducedMotion) return;
    if (details.rollMs <= 0) return;
    const startedAt = Date.now();
    setRollStep(0);
    const timer = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      if (elapsed >= details.rollMs) {
        window.clearInterval(timer);
        setRollStep(undefined);
        return;
      }
      setRollStep(Math.floor(elapsed / ROLL_STEP_MS));
    }, ROLL_STEP_MS);
    return () => {
      window.clearInterval(timer);
      setRollStep(undefined);
    };
  }, [props.count, props.rollCount, details.rollMs, prefersReducedMotion]);

  function at(point: IsoPoint) {
    return projectIsoPoint({ point, projection });
  }

  const unit = projection.unit;
  const tubeY = position.y + size.d / 2;
  const socketBottom = position.z + PLINTH_HEIGHT;
  const glassBottom = socketBottom + SOCKET_HEIGHT;
  const glassTop = glassBottom + GLASS_HEIGHT;
  const pitch = size.w / TUBE_COUNT;
  const digits = getTubeDigits({
    count: props.count ?? 0,
    tubeCount: TUBE_COUNT,
  }).map((tube, index) => ({
    ...tube,
    shown:
      rollStep === undefined
        ? tube.digit
        : (tube.digit + rollStep + index * 3) % 10,
    lit: isLit && (tube.lit || rollStep !== undefined),
  }));
  const brackets = [
    position.x + BRACKET_INSET,
    position.x + size.w - BRACKET_INSET - 0.1,
  ];
  const plinthFront = getFacePlane({
    plane: "front",
    origin: {
      x: position.x,
      y: position.y + size.d,
      z: position.z + PLINTH_HEIGHT,
    },
    projection,
  });
  const plinthSide = getFacePlane({
    plane: "side",
    origin: {
      x: position.x + size.w,
      y: position.y + size.d,
      z: position.z + PLINTH_HEIGHT,
    },
    projection,
  });
  const plinthWidthFace = size.w * unit;
  const seamY = PLINTH_HEIGHT * unit * 0.62;
  const plinthHeightFace = PLINTH_HEIGHT * unit;

  return (
    <g data-tube-display strokeLinejoin="round" strokeLinecap="round">
      <g className={partStroke(props.highlighted)} strokeWidth={1}>
        {brackets.map((x) => {
          const strapScrew = at({
            x: x + 0.05,
            y: position.y,
            z: position.z - BRACKET_DROP * 0.7,
          });
          return (
            <g key={x}>
              <IsoBox
                position={{ x, y: position.y, z: position.z - BRACKET_DROP }}
                size={{ w: 0.1, d: 0.06, h: BRACKET_DROP }}
                projection={projection}
              />
              <IsoBox
                position={{ x, y: position.y, z: position.z - 0.07 }}
                size={{ w: 0.1, d: size.d * 0.8, h: 0.07 }}
                projection={projection}
              />
              <circle
                cx={strapScrew.x}
                cy={strapScrew.y}
                r={SCREW_RADIUS * 2}
                className="fill-none stroke-[var(--lm-detail)]"
                strokeWidth={0.5}
              />
              <circle
                cx={strapScrew.x}
                cy={strapScrew.y}
                r={SCREW_RADIUS}
                className="fill-[var(--lm-line)] stroke-none"
              />
            </g>
          );
        })}
        <IsoBox
          position={position}
          size={{ w: size.w, d: size.d, h: PLINTH_HEIGHT }}
          projection={projection}
        />
      </g>
      <g transform={plinthFront.transform}>
        <line
          x1={0}
          y1={seamY}
          x2={plinthWidthFace}
          y2={seamY}
          className="stroke-[var(--lm-detail)]"
          strokeWidth={0.75}
        />
        {[0.07, 0.93].map((ratio) => (
          <g key={ratio}>
            <circle
              cx={plinthWidthFace * ratio}
              cy={plinthHeightFace * 0.3}
              r={SCREW_RADIUS * 2}
              className="fill-none stroke-[var(--lm-detail)]"
              strokeWidth={0.5}
            />
            <circle
              cx={plinthWidthFace * ratio}
              cy={plinthHeightFace * 0.3}
              r={SCREW_RADIUS}
              className="fill-[var(--lm-line)] stroke-none"
            />
          </g>
        ))}
        <circle
          cx={plinthWidthFace * 0.82}
          cy={plinthHeightFace * 0.3}
          r={1.3}
          className={cn(
            "stroke-none",
            isLit ? "fill-[var(--lm-accent)]" : "fill-[var(--lm-detail)]"
          )}
        />
      </g>
      <line
        transform={plinthSide.transform}
        x1={0}
        y1={seamY}
        x2={size.d * unit}
        y2={seamY}
        className="stroke-[var(--lm-detail)]"
        strokeWidth={0.75}
      />
      {digits.map((tube, index) => {
        const centerX = position.x + pitch * (index + 0.5);
        const center = { x: centerX, y: tubeY };
        const bottom = at({ ...center, z: glassBottom });
        const top = at({ ...center, z: glassTop });
        const glassBase = getIsoEllipse({
          center: { ...center, z: glassBottom },
          radius: GLASS_RADIUS,
          projection,
        });
        const halfWidth = glassBase.rx;
        const domeHeight = halfWidth * DOME_RATIO;
        const tipTop = top.y - domeHeight - TIP_HEIGHT * unit;
        const glass = [
          `M ${top.x - halfWidth} ${bottom.y}`,
          `L ${top.x - halfWidth} ${top.y}`,
          `A ${halfWidth} ${domeHeight} 0 0 1 ${top.x + halfWidth} ${top.y}`,
          `L ${top.x + halfWidth} ${bottom.y}`,
          `A ${halfWidth} ${glassBase.ry} 0 0 1 ${top.x - halfWidth} ${bottom.y}`,
          "Z",
        ].join(" ");
        const digitPlane = getFacePlane({
          plane: "front",
          origin: { x: centerX, y: tubeY, z: glassTop - 0.08 },
          projection,
        });
        const digitHeight = (GLASS_HEIGHT - 0.2) * unit;
        const meshHalf = GLASS_RADIUS * unit * 0.95;
        return (
          <g key={index}>
            <IsoCylinder
              center={center}
              bottom={socketBottom}
              top={glassBottom}
              radius={SOCKET_RADIUS}
              projection={projection}
            />
            <path
              d={glass}
              className="fill-[var(--lm-recess)] stroke-none"
              fillOpacity={0.85}
            />
            <g transform={digitPlane.transform}>
              <line
                x1={-meshHalf}
                y1={0}
                x2={meshHalf}
                y2={0}
                className="stroke-[var(--lm-detail)]"
                strokeWidth={0.6}
              />
              <line
                x1={-meshHalf}
                y1={digitHeight + 0.08 * unit}
                x2={meshHalf}
                y2={digitHeight + 0.08 * unit}
                className="stroke-[var(--lm-detail)]"
                strokeWidth={0.6}
              />
              <text
                x={0}
                y={digitHeight * 0.55}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={digitHeight}
                className="fill-[var(--lm-ink)] stroke-none font-[family-name:var(--lm-font-display)]"
                opacity={details.ghostOpacity}
              >
                8
              </text>
              {tube.lit && (
                <text
                  x={0}
                  y={digitHeight * 0.55}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={digitHeight}
                  className="fill-none stroke-[var(--lm-accent)] font-[family-name:var(--lm-font-display)]"
                  strokeWidth={digitHeight * 0.16}
                  opacity={details.digitGlow * 0.45}
                >
                  {tube.shown}
                </text>
              )}
              {tube.lit && (
                <text
                  x={0}
                  y={digitHeight * 0.55}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={digitHeight}
                  className="fill-[var(--lm-accent-hi)] stroke-none font-[family-name:var(--lm-font-display)]"
                >
                  {tube.shown}
                </text>
              )}
              {Array.from({ length: MESH_COLUMNS }, (_, column) => {
                const x =
                  -meshHalf + ((column + 0.5) / MESH_COLUMNS) * meshHalf * 2;
                return (
                  <line
                    key={column}
                    x1={x}
                    y1={0}
                    x2={x}
                    y2={digitHeight + 0.08 * unit}
                    className="stroke-[var(--lm-detail)]"
                    strokeWidth={0.4}
                    opacity={0.35}
                  />
                );
              })}
            </g>
            <path
              d={glass}
              className={cn("fill-none", partStroke(props.highlighted))}
              strokeWidth={1}
            />
            <line
              x1={top.x - halfWidth * HIGHLIGHT_OFFSET}
              y1={bottom.y - 2}
              x2={top.x - halfWidth * HIGHLIGHT_OFFSET}
              y2={top.y - domeHeight * HIGHLIGHT_DOME_RISE}
              className="stroke-[var(--lm-ink-hi)]"
              strokeWidth={0.75}
              opacity={0.18}
            />
            <line
              x1={top.x}
              y1={top.y - domeHeight}
              x2={top.x}
              y2={tipTop}
              className={partStroke(props.highlighted)}
              strokeWidth={1}
            />
            <circle
              cx={top.x}
              cy={tipTop}
              r={1}
              className="fill-[var(--lm-face)] stroke-[var(--lm-line)]"
              strokeWidth={0.75}
            />
          </g>
        );
      })}
    </g>
  );
}
