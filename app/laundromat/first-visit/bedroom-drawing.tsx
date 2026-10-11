import { useId } from "react";

import { DaylightPatch } from "@/app/laundromat/daylight-patch";
import { IsoBox } from "@/app/laundromat/objects/iso-box";
import { WindowDrawing } from "@/app/laundromat/objects/window-drawing";
import { WallClock } from "@/app/laundromat/wall-clock";
import type { BedroomConfig } from "@/lib/laundromat/first-visit/bedroom-config";
import { getDaylightPatch } from "@/lib/laundromat/get-daylight-patch";
import { getFacePlane } from "@/lib/laundromat/get-face-plane";
import { getIsoCylinder } from "@/lib/laundromat/get-iso-cylinder";
import type { TimeOfDay } from "@/lib/laundromat/get-time-of-day";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import { projectIsoPoint } from "@/lib/laundromat/project-iso-point";
import type { IsoPoint, SceneConfig } from "@/lib/laundromat/scene-config";
import { toSvgPoints } from "@/lib/laundromat/to-svg-points";
import { cn } from "@/lib/utils";

import { BedLaundryPile } from "./bed-laundry-pile";

const PLANK_WIDTH = 0.42;
const PLANK_JOINT_STEP = 1.9;
const SKIRTING_HEIGHT = 0.12;
const CURTAIN_DROP = 0.3;
const LAMP_GLOW_OPACITY = 0.14;
const POOL_PEAK_OPACITY = 0.2;
const BED_LIGHT_PEAK_OPACITY = 0.6;
const BED_LIGHT_REACH = 2.2;
const DAYLIGHT_PATCH_REACH = 2.3;

type BedroomDrawingProps = {
  bedroom: BedroomConfig;
  projection: IsoProjection;
  timeOfDay: TimeOfDay | undefined;
  hour: number | undefined;
  scene: SceneConfig;
  lampOn: boolean;
  lampHighlighted: boolean;
  cleanPile: boolean;
};

export function BedroomDrawing(props: BedroomDrawingProps) {
  const id = useId();
  const { bedroom, projection, timeOfDay, scene } = props;
  const { width, depth, wallHeight } = bedroom.room;
  const { unit } = projection;
  function at(x: number, y: number, z: number) {
    return projectIsoPoint({ point: { x, y, z }, projection });
  }
  const floorPlane = `${getFacePlane({ plane: "top", origin: { x: 0, y: 0, z: 0 }, projection }).transform} scale(${unit})`;
  const glide = { transition: `opacity ${scene.sky.timeJumpGlideMs}ms` };
  const lampIntensity = props.lampOn ? 1 : 0;

  const plankRows = Array.from(
    { length: Math.floor(depth / PLANK_WIDTH) },
    (_, index) => (index + 1) * PLANK_WIDTH
  );
  const plankJoints = plankRows.flatMap((rowY, row) => {
    const offset = (row % 3) * (PLANK_JOINT_STEP / 3) + 0.4;
    return Array.from(
      { length: Math.ceil(width / PLANK_JOINT_STEP) },
      (_, index) => offset + index * PLANK_JOINT_STEP
    )
      .filter((x) => x < width)
      .map((x) => ({ x, from: rowY - PLANK_WIDTH, to: rowY }));
  });

  const { window } = bedroom;
  const opening = {
    near: window.position.y + 0.16,
    far: window.position.y + window.size.d - 0.16,
    top: window.position.z + window.size.h - 0.16,
  };
  const openingWidth = opening.far - opening.near;
  const curtainPlane = getFacePlane({
    plane: "side",
    origin: { x: window.size.w + 0.04, y: opening.far, z: opening.top },
    projection,
  });
  const curtainLength = window.size.h - 0.32 + CURTAIN_DROP;
  const daylightPatch = getDaylightPatch({
    wallX: window.size.w,
    fromY: opening.near,
    toY: opening.far,
    reach: DAYLIGHT_PATCH_REACH,
    sun: timeOfDay?.sun,
  }).map((point) => at(point.x, point.y, 0));

  const { bedsideTable, lamp, bed, rug } = bedroom;
  const tableFront = getFacePlane({
    plane: "front",
    origin: {
      x: bedsideTable.position.x,
      y: bedsideTable.position.y + bedsideTable.size.d,
      z: bedsideTable.size.h,
    },
    projection,
  });
  const tableTop = bedsideTable.position.z + bedsideTable.size.h;
  const lampBase = getIsoCylinder({
    center: lamp.center,
    bottom: tableTop,
    top: tableTop + 0.08,
    radius: 0.18,
    projection,
  });
  const shadeBottom = tableTop + 0.36;
  const shade = getIsoCylinder({
    center: lamp.center,
    bottom: shadeBottom,
    top: shadeBottom + 0.38,
    radius: lamp.shadeRadius + 0.05,
    topRadius: lamp.shadeRadius - 0.08,
    projection,
  });
  const stemTop = at(lamp.center.x, lamp.center.y, shadeBottom + 0.06);
  const lampGlow = at(lamp.center.x, lamp.center.y, shadeBottom + 0.1);
  const headboardFront = getFacePlane({
    plane: "front",
    origin: {
      x: bed.headboard.position.x,
      y: bed.headboard.position.y + bed.headboard.size.d,
      z: bed.headboard.size.h,
    },
    projection,
  });
  const blanketTop = bed.blanket.position.z + bed.blanket.size.h;
  const blanketFold = [
    at(bed.blanket.position.x, bed.blanket.position.y + 0.18, blanketTop),
    at(
      bed.blanket.position.x + bed.blanket.size.w,
      bed.blanket.position.y + 0.18,
      blanketTop
    ),
  ];
  const fringe = Array.from(
    { length: Math.floor(rug.width / 0.21) },
    (_, index) => 0.12 + index * 0.21
  );

  function box(options: {
    position: IsoPoint;
    size: { w: number; d: number; h: number };
  }) {
    return (
      <IsoBox
        position={options.position}
        size={options.size}
        projection={projection}
      />
    );
  }

  return (
    <g data-bedroom strokeLinejoin="round" strokeLinecap="round">
      <defs>
        <radialGradient id={`${id}-pool`}>
          <stop
            offset={0}
            stopColor={scene.light.lampColor}
            stopOpacity={0.8}
          />
          <stop offset={1} stopColor={scene.light.lampColor} stopOpacity={0} />
        </radialGradient>
        <filter
          id={`${id}-bloom`}
          filterUnits="userSpaceOnUse"
          x={0}
          y={0}
          width={bedroom.stage.width}
          height={bedroom.stage.height}
        >
          <feGaussianBlur stdDeviation={24} />
        </filter>
      </defs>
      <g className="stroke-[var(--lm-line)]">
        <polygon
          className="fill-[var(--lm-face-top)]"
          points={toSvgPoints([
            at(0, 0, 0),
            at(width, 0, 0),
            at(width, depth, 0),
            at(0, depth, 0),
          ])}
        />
        <g transform={floorPlane} className="stroke-[var(--lm-detail)]">
          {plankRows.map((rowY) => (
            <line key={rowY} x1={0} y1={rowY} x2={width} y2={rowY} />
          ))}
          {plankJoints.map((joint) => (
            <line
              key={`${joint.x},${joint.to}`}
              x1={joint.x}
              y1={joint.from}
              x2={joint.x}
              y2={joint.to}
            />
          ))}
        </g>
        <polygon
          className="fill-[var(--lm-wall)]"
          points={toSvgPoints([
            at(0, 0, 0),
            at(width, 0, 0),
            at(width, 0, wallHeight),
            at(0, 0, wallHeight),
          ])}
        />
        <polygon
          className="fill-[var(--lm-wall-2)]"
          points={toSvgPoints([
            at(0, 0, 0),
            at(0, depth, 0),
            at(0, depth, wallHeight),
            at(0, 0, wallHeight),
          ])}
        />
        <polyline
          className="fill-none stroke-[var(--lm-detail)]"
          points={toSvgPoints([
            at(0, depth, SKIRTING_HEIGHT),
            at(0, 0, SKIRTING_HEIGHT),
            at(width, 0, SKIRTING_HEIGHT),
          ])}
        />
      </g>

      <WindowDrawing
        laidOut={{
          object: { id: "bedroom-window", kind: "window", ...window },
        }}
        projection={projection}
        highlighted={false}
        timeOfDay={timeOfDay}
        config={scene}
      />
      <g
        transform={`${curtainPlane.transform} scale(${unit})`}
        className="stroke-[var(--lm-line)]"
      >
        {[
          { edge: -0.32, inner: 0.3, sway: 0.16 },
          {
            edge: openingWidth + 0.32,
            inner: openingWidth - 0.3,
            sway: openingWidth - 0.16,
          },
        ].map((panel) => (
          <g key={panel.edge}>
            <path
              className="fill-[var(--lm-face)]"
              d={`M ${panel.edge} -0.2 L ${panel.inner} -0.2 Q ${panel.sway + (panel.inner - panel.sway) * 0.4} ${curtainLength * 0.3} ${panel.sway} ${curtainLength * 0.5} Q ${panel.sway - (panel.inner - panel.sway) * 0.6} ${curtainLength * 0.7} ${panel.inner - (panel.inner - panel.sway) * 0.5} ${curtainLength} L ${panel.edge} ${curtainLength} Z`}
            />
            <path
              className="fill-none stroke-[var(--lm-detail)]"
              d={[0.25, 0.5, 0.75]
                .map((ratio) => {
                  const x =
                    panel.edge + (panel.inner - panel.edge) * ratio * 0.8;
                  return `M ${x} -0.18 Q ${x + 0.02} ${curtainLength * 0.5} ${x - 0.02} ${curtainLength - 0.02}`;
                })
                .join(" ")}
            />
          </g>
        ))}
        <line
          className="stroke-[var(--lm-ink)]"
          strokeWidth={1.4}
          x1={-0.44}
          y1={-0.22}
          x2={openingWidth + 0.44}
          y2={-0.22}
        />
        {[-0.46, openingWidth + 0.46].map((x) => (
          <circle
            key={x}
            className="fill-[var(--lm-face)] stroke-[var(--lm-ink)]"
            cx={x}
            cy={-0.22}
            r={0.04}
          />
        ))}
      </g>

      {props.hour !== undefined && (
        <WallClock
          center={bedroom.clock.center}
          depth={bedroom.clock.depth}
          radius={bedroom.clock.radius}
          wall="back"
          hour={props.hour}
          projection={projection}
          details={scene.details.clock}
        />
      )}

      <DaylightPatch
        points={daylightPatch}
        color={timeOfDay?.daylightPatchColor ?? scene.light.daylightColor}
        opacity={timeOfDay?.daylightPatchOpacity ?? 0}
        glideMs={scene.sky.timeJumpGlideMs}
      />
      <g
        transform={floorPlane}
        className="pointer-events-none"
        style={{ opacity: lampIntensity * POOL_PEAK_OPACITY, ...glide }}
      >
        <ellipse
          fill={`url(#${id}-pool)`}
          cx={bedroom.lightPool.at.x}
          cy={bedroom.lightPool.at.y}
          rx={bedroom.lightPool.radiusX}
          ry={bedroom.lightPool.radiusY}
        />
      </g>

      <g transform={`translate(0 2.5) ${floorPlane}`}>
        <rect
          className="fill-[var(--lm-recess)] stroke-[var(--lm-detail)]"
          x={rug.at.x}
          y={rug.at.y}
          width={rug.width}
          height={rug.depth}
          rx={0.16}
        />
      </g>
      <g transform={floorPlane}>
        <rect
          className="fill-[var(--lm-face)] stroke-[var(--lm-line)]"
          x={rug.at.x}
          y={rug.at.y}
          width={rug.width}
          height={rug.depth}
          rx={0.16}
        />
        <rect
          className="fill-none stroke-[var(--lm-detail)] [stroke-dasharray:3_3]"
          x={rug.at.x + 0.16}
          y={rug.at.y + 0.16}
          width={rug.width - 0.32}
          height={rug.depth - 0.32}
          rx={0.1}
        />
        <g className="stroke-[var(--lm-line)]">
          {fringe.map((x) => (
            <line
              key={x}
              x1={rug.at.x + x}
              y1={rug.at.y + rug.depth}
              x2={rug.at.x + x}
              y2={rug.at.y + rug.depth + 0.13}
            />
          ))}
        </g>
      </g>

      <g className="stroke-[var(--lm-line)]">
        {box(bedsideTable)}
        <g
          transform={tableFront.transform}
          className="fill-none stroke-[var(--lm-detail)]"
        >
          <line
            x1={0.08 * unit}
            y1={0.24 * unit}
            x2={(bedsideTable.size.w - 0.08) * unit}
            y2={0.24 * unit}
          />
          <circle
            className="fill-[var(--lm-detail)]"
            cx={(bedsideTable.size.w / 2) * unit}
            cy={0.34 * unit}
            r={1.5}
          />
        </g>
        <circle
          className="pointer-events-none fill-[var(--lm-accent)]"
          filter={`url(#${id}-bloom)`}
          cx={lampGlow.x}
          cy={lampGlow.y}
          r={60}
          style={{ opacity: lampIntensity * LAMP_GLOW_OPACITY, ...glide }}
        />
        <path className="fill-[var(--lm-face)]" d={lampBase.body} />
        <ellipse {...lampBase.top} className="fill-[var(--lm-face-top)]" />
        <line
          strokeWidth={1.4}
          x1={lampBase.top.cx}
          y1={lampBase.top.cy}
          x2={stemTop.x}
          y2={stemTop.y}
        />
        <g
          className={cn(
            "[&_*]:transition-[stroke,fill,opacity] [&_*]:duration-300",
            props.lampHighlighted && "stroke-[var(--lm-ink-hi)]"
          )}
        >
          <ellipse
            className={
              props.lampOn
                ? "fill-[var(--lm-accent-hi)]"
                : "fill-[var(--lm-face-top)]"
            }
            cx={shade.base.cx}
            cy={shade.base.cy}
            rx={shade.base.rx * 0.8}
            ry={shade.base.ry * 0.8}
            opacity={props.lampOn ? 0.85 : 1}
          />
          <path
            className={cn(
              "fill-[var(--lm-face)]",
              props.lampOn && "stroke-[var(--lm-accent)]"
            )}
            d={shade.body}
          />
          <path
            className="fill-[var(--lm-accent)] stroke-none"
            d={shade.body}
            opacity={props.lampOn ? 0.16 : 0}
          />
          <ellipse
            {...shade.top}
            className={cn(
              "fill-[var(--lm-recess)]",
              props.lampOn && "stroke-[var(--lm-accent)]"
            )}
          />
        </g>

        {box(bed.headboard)}
        <g
          transform={headboardFront.transform}
          className="fill-none stroke-[var(--lm-detail)]"
        >
          <rect
            x={0.12 * unit}
            y={0.12 * unit}
            width={(bed.headboard.size.w - 0.24) * unit}
            height={(bed.headboard.size.h - 0.5) * unit}
          />
        </g>
        {box(bed.frame)}
        {box(bed.mattress)}
        {box(bed.pillow)}
        {box(bed.blanket)}
        <polyline
          className="fill-none stroke-[var(--lm-detail)]"
          points={toSvgPoints(blanketFold)}
        />
        {props.cleanPile && (
          <BedLaundryPile bed={bed} projection={projection} />
        )}
      </g>
      <g
        transform={`translate(0 ${-blanketTop * unit}) ${floorPlane}`}
        className="pointer-events-none"
        style={{ opacity: lampIntensity * BED_LIGHT_PEAK_OPACITY, ...glide }}
      >
        <clipPath id={`${id}-bed-top`}>
          <rect
            x={bed.mattress.position.x}
            y={bed.mattress.position.y}
            width={bed.mattress.size.w}
            height={bed.mattress.size.d}
          />
        </clipPath>
        <ellipse
          fill={`url(#${id}-pool)`}
          clipPath={`url(#${id}-bed-top)`}
          cx={lamp.center.x}
          cy={lamp.center.y}
          rx={BED_LIGHT_REACH}
          ry={BED_LIGHT_REACH}
        />
      </g>
    </g>
  );
}
