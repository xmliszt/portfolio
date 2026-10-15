import { useId } from "react";
import type { MotionValue } from "motion/react";

import { useLocalWeather } from "@/app/laundromat/local-weather/use-local-weather";
import { IsoBox } from "@/app/laundromat/objects/iso-box";
import { WindowDrawing } from "@/app/laundromat/objects/window-drawing";
import { useRenderQuality } from "@/app/laundromat/settings/use-render-quality";
import { WallClock } from "@/app/laundromat/wall-clock";
import type { BedroomConfig } from "@/lib/laundromat/first-visit/bedroom-config";
import type { BedroomWindowLight } from "@/lib/laundromat/first-visit/get-bedroom-window-light";
import type { getCurtainLayout } from "@/lib/laundromat/first-visit/get-curtain-layout";
import { getTableLampShape } from "@/lib/laundromat/first-visit/get-table-lamp-shape";
import { getFacePlane } from "@/lib/laundromat/get-face-plane";
import type { TimeOfDay } from "@/lib/laundromat/get-time-of-day";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import { projectIsoPoint } from "@/lib/laundromat/project-iso-point";
import type { IsoPoint, SceneConfig } from "@/lib/laundromat/scene-config";
import { toSvgPoints } from "@/lib/laundromat/to-svg-points";

import { BedDrawing } from "./bed-drawing";
import { BedLaundryPile } from "./bed-laundry-pile";
import { CurtainDaylight } from "./curtain-daylight";
import { CurtainDrawing } from "./curtain-drawing";
import { CurtainRoomFill } from "./curtain-room-fill";
import { RugCredit } from "./rug-credit";
import { TableLampDrawing } from "./table-lamp-drawing";
import type { CurtainPose } from "./use-curtain-pose";

const PLANK_WIDTH = 0.42;
const PLANK_JOINT_STEP = 1.9;
const SKIRTING_HEIGHT = 0.12;
const LAMP_GLOW_OPACITY = 0.14;
const LAMP_FILL = { opacity: 0.2, reach: 5 };
const POOL_PEAK_OPACITY = 0.2;
const BED_LIGHT_PEAK_OPACITY = 0.6;
const BED_LIGHT_REACH = 2.2;

type BedroomDrawingProps = {
  bedroom: BedroomConfig;
  projection: IsoProjection;
  timeOfDay: TimeOfDay | undefined;
  hour: number | undefined;
  scene: SceneConfig;
  lampOn: boolean;
  lampHighlighted: boolean;
  curtainPose: MotionValue<CurtainPose>;
  curtainLayout: ReturnType<typeof getCurtainLayout>;
  windowLight: BedroomWindowLight | undefined;
  curtainHighlighted: boolean;
  bedHighlighted: boolean;
  cleanPile: boolean;
};

export function BedroomDrawing(props: BedroomDrawingProps) {
  const id = useId();
  const { reading: weather } = useLocalWeather();
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

  const { quality: renderTier } = useRenderQuality();
  const { curtainPose, curtainLayout, windowLight } = props;
  const shell = [
    at(0, depth, 0),
    at(0, depth, wallHeight),
    at(0, 0, wallHeight),
    at(width, 0, wallHeight),
    at(width, 0, 0),
    at(width, depth, 0),
  ];

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
  const lampShape = getTableLampShape({
    center: lamp.center,
    tableTop,
    domeRadius: lamp.shadeRadius,
    projection,
  });
  const shadeBottom = lampShape.rimZ;
  const lampGlow = at(lamp.center.x, lamp.center.y, shadeBottom - 0.04);
  const headboardFront = getFacePlane({
    plane: "front",
    origin: {
      x: bed.headboard.position.x,
      y: bed.headboard.position.y + bed.headboard.size.d,
      z: bed.headboard.size.h,
    },
    projection,
  });
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
        <radialGradient
          id={`${id}-lamp-fill`}
          gradientUnits="userSpaceOnUse"
          cx={lampGlow.x}
          cy={lampGlow.y}
          r={LAMP_FILL.reach * unit}
        >
          <stop offset={0} stopColor={scene.light.lampColor} />
          <stop
            offset={0.3}
            stopColor={scene.light.lampColor}
            stopOpacity={0.45}
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

      {windowLight !== undefined && (
        <CurtainRoomFill
          pose={curtainPose}
          layout={curtainLayout}
          curtain={bedroom.curtain}
          room={bedroom.room}
          stage={bedroom.stage}
          projection={projection}
          light={windowLight}
        />
      )}
      <polygon
        className="pointer-events-none"
        fill={`url(#${id}-lamp-fill)`}
        points={toSvgPoints(shell)}
        style={{ opacity: lampIntensity * LAMP_FILL.opacity, ...glide }}
      />
      <WindowDrawing
        laidOut={{
          object: { id: "bedroom-window", kind: "window", ...bedroom.window },
        }}
        projection={projection}
        highlighted={false}
        timeOfDay={timeOfDay}
        config={scene}
        view="skyline"
        weather={weather?.condition}
      />
      <CurtainDrawing
        pose={curtainPose}
        layout={curtainLayout}
        curtain={bedroom.curtain}
        projection={projection}
        light={windowLight}
        tier={renderTier}
        highlighted={props.curtainHighlighted}
      />

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

      {windowLight?.sources.map((source) => (
        <CurtainDaylight
          key={source.key}
          pose={curtainPose}
          layout={curtainLayout}
          curtain={bedroom.curtain}
          projection={projection}
          source={source}
          scene={scene}
          tier={renderTier}
        />
      ))}
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
        <RugCredit rug={rug} />
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
        <TableLampDrawing
          shape={lampShape}
          center={lamp.center}
          table={bedsideTable}
          domeRadius={lamp.shadeRadius}
          projection={projection}
          lampOn={props.lampOn}
          lampColor={scene.light.lampColor}
          highlighted={props.lampHighlighted}
          glideMs={scene.sky.timeJumpGlideMs}
        />

        <BedDrawing
          bed={bed}
          projection={projection}
          highlighted={props.bedHighlighted}
          lampLight={{
            center: lamp.center,
            reach: BED_LIGHT_REACH,
            fill: `url(#${id}-pool)`,
            style: {
              opacity: lampIntensity * BED_LIGHT_PEAK_OPACITY,
              ...glide,
            },
          }}
          headboardLight={
            <g
              transform={headboardFront.transform}
              className="pointer-events-none stroke-none"
              style={{
                opacity: lampIntensity * BED_LIGHT_PEAK_OPACITY,
                ...glide,
              }}
            >
              <radialGradient
                id={`${id}-headboard-light`}
                gradientUnits="userSpaceOnUse"
                cx={(lamp.center.x - bed.headboard.position.x) * unit}
                cy={(bed.headboard.size.h - shadeBottom) * unit}
                r={BED_LIGHT_REACH * unit}
              >
                <stop
                  offset={0}
                  stopColor={scene.light.lampColor}
                  stopOpacity={0.8}
                />
                <stop
                  offset={1}
                  stopColor={scene.light.lampColor}
                  stopOpacity={0}
                />
              </radialGradient>
              <rect
                fill={`url(#${id}-headboard-light)`}
                width={bed.headboard.size.w * unit}
                height={bed.headboard.size.h * unit}
              />
            </g>
          }
        >
          {props.cleanPile && (
            <BedLaundryPile bed={bed} projection={projection} />
          )}
        </BedDrawing>
      </g>
      <g
        transform={`translate(0 ${-(bed.headboard.position.z + bed.headboard.size.h) * unit}) ${floorPlane}`}
        className="pointer-events-none"
        style={{ opacity: lampIntensity * BED_LIGHT_PEAK_OPACITY, ...glide }}
      >
        <clipPath id={`${id}-headboard-top`}>
          <rect
            x={bed.headboard.position.x}
            y={bed.headboard.position.y}
            width={bed.headboard.size.w}
            height={bed.headboard.size.d}
          />
        </clipPath>
        <ellipse
          fill={`url(#${id}-pool)`}
          clipPath={`url(#${id}-headboard-top)`}
          cx={lamp.center.x}
          cy={lamp.center.y}
          rx={BED_LIGHT_REACH}
          ry={BED_LIGHT_REACH}
        />
      </g>
    </g>
  );
}
