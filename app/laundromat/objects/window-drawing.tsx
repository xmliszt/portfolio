import { useId } from "react";

import type { LaidOutObject } from "@/lib/laundromat/build-scene-layout";
import { getFacePlane } from "@/lib/laundromat/get-face-plane";
import type { TimeOfDay } from "@/lib/laundromat/get-time-of-day";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import { projectIsoPoint } from "@/lib/laundromat/project-iso-point";
import type { SceneConfig } from "@/lib/laundromat/scene-config";
import { toSvgPoints } from "@/lib/laundromat/to-svg-points";

import { IsoBox } from "./iso-box";
import { partStroke } from "./part-stroke";
import { StreetView } from "./street-view";

const CASING = 0.16;
const GLASS_X = 0.06;
const SILL_NOSE_DEPTH = 0.1;
const SUN_RADIUS = 0.28;
const MOON_RADIUS = 0.2;
const MOON_AT = { across: 0.3, up: 0.8 };
const STARS = [
  { across: 0.12, up: 0.92 },
  { across: 0.48, up: 0.94 },
  { across: 0.62, up: 0.74 },
  { across: 0.82, up: 0.88 },
  { across: 0.22, up: 0.66 },
  { across: 0.9, up: 0.68 },
];
const FAR_SKYLINE = [
  { at: 0, width: 0.16, height: 0.34 },
  { at: 0.15, width: 0.12, height: 0.46 },
  { at: 0.26, width: 0.18, height: 0.3 },
  { at: 0.43, width: 0.1, height: 0.52 },
  { at: 0.52, width: 0.2, height: 0.36 },
  { at: 0.71, width: 0.13, height: 0.44 },
  { at: 0.83, width: 0.17, height: 0.32 },
];
const SKYLINE_DEPTH_PER_WIDTH = 0.7;
const SKYLINE_MAX_DEPTH = 0.1;
const NEAR_SKYLINE = [
  { at: -0.02, width: 0.22, height: 0.22 },
  { at: 0.2, width: 0.14, height: 0.3 },
  { at: 0.33, width: 0.24, height: 0.16 },
  { at: 0.56, width: 0.16, height: 0.26 },
  { at: 0.71, width: 0.31, height: 0.2 },
];
const LIT_WINDOWS = [
  { building: 0, column: 1, row: 1 },
  { building: 1, column: 0, row: 3 },
  { building: 1, column: 2, row: 1 },
  { building: 3, column: 1, row: 2 },
  { building: 4, column: 0, row: 0 },
  { building: 4, column: 2, row: 2 },
];

type WindowDrawingProps = {
  laidOut: Pick<LaidOutObject, "object">;
  projection: IsoProjection;
  highlighted: boolean;
  timeOfDay: TimeOfDay | undefined;
  config: SceneConfig;
  view: "street" | "skyline";
};

export function WindowDrawing(props: WindowDrawingProps) {
  const id = useId();
  const { position: p, size } = props.laidOut.object;
  const { projection, timeOfDay, config } = props;
  const { unit } = projection;
  const { sky } = config;
  function at(x: number, y: number, z: number) {
    return projectIsoPoint({ point: { x, y, z }, projection });
  }
  const opening = {
    near: p.y + CASING,
    far: p.y + size.d - CASING,
    bottom: p.z + CASING,
    top: p.z + size.h - CASING,
  };
  const outer = p.x + size.w;
  const glassX = p.x + GLASS_X;
  const openingOutline = [
    at(outer, opening.far, opening.top),
    at(outer, opening.near, opening.top),
    at(outer, opening.near, opening.bottom),
    at(outer, opening.far, opening.bottom),
  ];
  const casingOutline = [
    at(outer, p.y + size.d, p.z + size.h),
    at(outer, p.y, p.z + size.h),
    at(outer, p.y, p.z),
    at(outer, p.y + size.d, p.z),
  ];
  const glass = getFacePlane({
    plane: "side",
    origin: { x: glassX, y: opening.far, z: opening.top },
    projection,
  });
  const paneWidth = (opening.far - opening.near) * unit;
  const paneHeight = (opening.top - opening.bottom) * unit;
  const glide = { transition: `opacity ${sky.timeJumpGlideMs}ms` };
  function onPane(spot: { across: number; up: number }) {
    return { x: spot.across * paneWidth, y: (1 - spot.up) * paneHeight };
  }
  const moon = onPane(MOON_AT);
  const sun =
    timeOfDay?.sun === undefined
      ? undefined
      : {
          center: onPane({
            across: 0.1 + 0.8 * timeOfDay.sun.progress,
            up: 0.08 + 0.72 * timeOfDay.sun.elevation,
          }),
          color: timeOfDay.sun.color,
        };
  const nightOpacity = timeOfDay?.nightOpacity ?? 1;
  const sideReveal = [
    at(glassX, opening.near, opening.top),
    at(outer, opening.near, opening.top),
    at(outer, opening.near, opening.bottom),
    at(glassX, opening.near, opening.bottom),
  ];
  const sillReveal = [
    at(glassX, opening.near, opening.bottom),
    at(outer, opening.near, opening.bottom),
    at(outer, opening.far, opening.bottom),
    at(glassX, opening.far, opening.bottom),
  ];

  function skylineBlock(options: {
    building: { at: number; width: number; height: number };
    tones: { front: string; side: string; top: string };
  }) {
    const { building, tones } = options;
    const left = building.at * paneWidth;
    const right = left + building.width * paneWidth;
    const top = (1 - building.height) * paneHeight;
    const depth =
      Math.min(building.width * SKYLINE_DEPTH_PER_WIDTH, SKYLINE_MAX_DEPTH) *
      paneWidth;
    return (
      <g key={building.at}>
        <polygon
          className={tones.side}
          points={toSvgPoints([
            { x: left, y: top },
            { x: left - depth, y: top - depth },
            { x: left - depth, y: paneHeight },
            { x: left, y: paneHeight },
          ])}
        />
        <polygon
          className={tones.top}
          points={toSvgPoints([
            { x: left, y: top },
            { x: right, y: top },
            { x: right - depth, y: top - depth },
            { x: left - depth, y: top - depth },
          ])}
        />
        <rect
          className={tones.front}
          x={left}
          y={top}
          width={right - left}
          height={paneHeight - top}
        />
      </g>
    );
  }

  return (
    <g data-window strokeLinejoin="round">
      <defs>
        <linearGradient id={`${id}-sky`} x1={0} y1={0} x2={0} y2={1}>
          <stop
            offset={0}
            style={{
              stopColor: timeOfDay?.skyTop ?? sky.keys[0].top,
              transition: `stop-color ${sky.timeJumpGlideMs}ms`,
            }}
          />
          <stop
            offset={1}
            style={{
              stopColor: timeOfDay?.skyHorizon ?? sky.keys[0].horizon,
              transition: `stop-color ${sky.timeJumpGlideMs}ms`,
            }}
          />
        </linearGradient>
        <clipPath id={`${id}-opening`}>
          <polygon points={toSvgPoints(openingOutline)} />
        </clipPath>
      </defs>
      <g className={partStroke(props.highlighted)}>
        <IsoBox position={p} size={size} projection={projection} />
      </g>
      <g clipPath={`url(#${id}-opening)`}>
        {props.view === "street" ? (
          <StreetView
            wallX={p.x}
            opening={opening}
            projection={projection}
            timeOfDay={timeOfDay}
            config={config}
          />
        ) : (
          <g transform={glass.transform}>
            <mask id={`${id}-behind-skyline`}>
              <rect width={paneWidth} height={paneHeight} fill="white" />
              {FAR_SKYLINE.map((building) =>
                skylineBlock({
                  building,
                  tones: {
                    front: "fill-black",
                    side: "fill-black",
                    top: "fill-black",
                  },
                })
              )}
            </mask>
            <rect
              width={paneWidth}
              height={paneHeight}
              fill={`url(#${id}-sky)`}
            />
            <g
              mask={`url(#${id}-behind-skyline)`}
              style={{ opacity: nightOpacity, ...glide }}
            >
              {STARS.map((star) => {
                const point = onPane(star);
                return (
                  <circle
                    key={`${star.across},${star.up}`}
                    cx={point.x}
                    cy={point.y}
                    r={0.7}
                    fill={sky.starColor}
                  />
                );
              })}
              <circle
                cx={moon.x}
                cy={moon.y}
                r={MOON_RADIUS * unit}
                fill={sky.moonColor}
              />
            </g>
            {sun !== undefined && (
              <circle
                mask={`url(#${id}-behind-skyline)`}
                cx={sun.center.x}
                cy={sun.center.y}
                r={SUN_RADIUS * unit}
                fill={sun.color}
              />
            )}
            <g
              className="stroke-[var(--lm-detail)]"
              strokeWidth={0.5}
              opacity={0.75}
            >
              {FAR_SKYLINE.toSorted((a, b) => b.at - a.at).map((building) =>
                skylineBlock({
                  building,
                  tones: {
                    front: "fill-[var(--lm-wall)]",
                    side: "fill-[var(--lm-face)]",
                    top: "fill-[var(--lm-face-top)]",
                  },
                })
              )}
            </g>
            <g
              className="fill-[var(--lm-accent-hi)]"
              style={{
                opacity: nightOpacity * config.details.window.litWindowOpacity,
                ...glide,
              }}
            >
              {LIT_WINDOWS.map((lit) => {
                const building = FAR_SKYLINE[lit.building + 1];
                return (
                  <rect
                    key={`${lit.building},${lit.column},${lit.row}`}
                    x={building.at * paneWidth + 2 + lit.column * 3}
                    y={(1 - building.height) * paneHeight + 3 + lit.row * 4}
                    width={1.4}
                    height={2}
                  />
                );
              })}
            </g>
            <g className="stroke-[var(--lm-detail)]" strokeWidth={0.5}>
              {NEAR_SKYLINE.toSorted((a, b) => b.at - a.at).map((building) =>
                skylineBlock({
                  building,
                  tones: {
                    front: "fill-[var(--lm-recess)]",
                    side: "fill-[var(--lm-wall)]",
                    top: "fill-[var(--lm-face)]",
                  },
                })
              )}
            </g>
          </g>
        )}
        <g className="stroke-[var(--lm-line)]">
          <polygon
            className="fill-[var(--lm-wall-2)]"
            points={toSvgPoints(sideReveal)}
          />
          <polygon
            className="fill-[var(--lm-face-top)]"
            points={toSvgPoints(sillReveal)}
          />
        </g>
        <g
          transform={glass.transform}
          className="fill-[var(--lm-face)] stroke-[var(--lm-line)]"
          strokeWidth={0.75}
        >
          <rect x={paneWidth / 2 - 1.5} y={0} width={3} height={paneHeight} />
          <rect
            x={0}
            y={paneHeight * 0.32 - 1.5}
            width={paneWidth}
            height={3}
          />
          <path
            d={`M ${paneWidth * 0.08} ${paneHeight * 0.9} L ${paneWidth * 0.3} ${paneHeight * 0.4}`}
            className="fill-none stroke-[var(--lm-ink-hi)]"
            strokeOpacity={0.08}
          />
        </g>
      </g>
      <path
        className="fill-[var(--lm-wall)] stroke-[var(--lm-line)]"
        fillRule="evenodd"
        d={`M ${toSvgPoints(casingOutline).replaceAll(" ", " L ")} Z M ${toSvgPoints(openingOutline).replaceAll(" ", " L ")} Z`}
      />
      <polygon
        className="fill-none stroke-[var(--lm-detail)]"
        strokeWidth={0.75}
        points={toSvgPoints(openingOutline)}
      />
      <g className={partStroke(props.highlighted)}>
        <IsoBox
          position={{
            x: outer,
            y: opening.near,
            z: p.z,
          }}
          size={{
            w: SILL_NOSE_DEPTH,
            d: opening.far - opening.near,
            h: CASING,
          }}
          projection={projection}
          bevel={false}
        />
      </g>
    </g>
  );
}
