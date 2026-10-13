import { useId } from "react";

import { getIsoCylinder } from "@/lib/laundromat/get-iso-cylinder";
import { getIsoEllipse } from "@/lib/laundromat/get-iso-ellipse";
import type { StreetLight } from "@/lib/laundromat/get-street-lights";
import { getStreetLights } from "@/lib/laundromat/get-street-lights";
import type { TimeOfDay } from "@/lib/laundromat/get-time-of-day";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import { projectIsoPoint } from "@/lib/laundromat/project-iso-point";
import type { SceneConfig } from "@/lib/laundromat/scene-config";
import { toSvgPoints } from "@/lib/laundromat/to-svg-points";

import { CylinderSides } from "./cylinder-sides";

const SIDEWALK_WIDTH = 3.6;
const KERB_WIDTH = 0.25;
const ROAD_DROP = 0.15;
const ROAD_WIDTH = 10;
const PAVING_STEP = 0.7;
const KERB_STEP = 1.1;
const BIKE_LANE_FROM_KERB = 1;
const LANE_DASH = { fromKerb: 1.9, length: 0.9, gap: 0.9 };
const LAMP = { fromWall: 3.25, height: 6, radius: 0.06, poolRadius: 1.7 };
const HYDRANT = { fromWall: 3.3, height: 0.45, radius: 0.13 };
const MANHOLE = { fromKerb: 1.3, radius: 0.34 };
const MAX_SHADOW_LENGTH = 8;
const AMBIENT_OPACITY = 0.16;
const LIGHT_TINT_OPACITY = 0.3;
const SHADOW_OPACITY = 0.35;

type StreetViewProps = {
  wallX: number;
  opening: { near: number; far: number };
  projection: IsoProjection;
  timeOfDay: TimeOfDay | undefined;
  config: SceneConfig;
};

export function StreetView(props: StreetViewProps) {
  const id = useId();
  const { wallX, opening, projection, timeOfDay, config } = props;
  const { unit } = projection;
  const glide = `opacity ${config.sky.timeJumpGlideMs}ms, fill ${config.sky.timeJumpGlideMs}ms`;
  function at(x: number, y: number, z: number) {
    return projectIsoPoint({ point: { x, y, z }, projection });
  }
  const kerbX = wallX - SIDEWALK_WIDTH;
  const roadEndX = kerbX - ROAD_WIDTH;
  const span = { from: opening.near - 8, to: opening.far + 1 };
  const road = { z: -ROAD_DROP, from: roadEndX, to: kerbX };
  const sidewalk = { z: 0, from: kerbX, to: wallX };
  function band(options: { from: number; to: number; z: number }) {
    return toSvgPoints([
      at(options.to, span.from, options.z),
      at(options.to, span.to, options.z),
      at(options.from, span.to, options.z),
      at(options.from, span.from, options.z),
    ]);
  }
  function clipped(options: { from: number; to: number }) {
    return [road, sidewalk]
      .map((ground) => ({
        z: ground.z,
        from: Math.max(ground.from, options.from),
        to: Math.min(ground.to, options.to),
      }))
      .filter((ground) => ground.to > ground.from);
  }
  const pavingJoints = Array.from(
    { length: Math.ceil((span.to - span.from) / PAVING_STEP) },
    (_, index) => span.from + index * PAVING_STEP
  );
  const kerbJoints = Array.from(
    { length: Math.ceil((span.to - span.from) / KERB_STEP) },
    (_, index) => span.from + index * KERB_STEP
  );
  const laneDashes = Array.from(
    {
      length: Math.ceil(
        (span.to - span.from) / (LANE_DASH.length + LANE_DASH.gap)
      ),
    },
    (_, index) => span.from + index * (LANE_DASH.length + LANE_DASH.gap)
  );
  const laneX = kerbX - LANE_DASH.fromKerb;
  const bikeLaneX = kerbX - BIKE_LANE_FROM_KERB;
  const lampBase = {
    x: wallX - LAMP.fromWall,
    y: opening.far - LAMP.fromWall - 0.6,
  };
  const hydrantBase = {
    x: wallX - HYDRANT.fromWall,
    y: opening.near - HYDRANT.fromWall + 0.9,
  };
  const manhole = getIsoEllipse({
    center: {
      x: kerbX - MANHOLE.fromKerb,
      y: (opening.near + opening.far) / 2 - SIDEWALK_WIDTH - 1.2,
      z: road.z,
    },
    radius: MANHOLE.radius,
    projection,
  });
  const lampPool = getIsoEllipse({
    center: { ...lampBase, z: 0 },
    radius: LAMP.poolRadius,
    projection,
  });
  const collar = getIsoCylinder({
    center: lampBase,
    bottom: 0,
    top: 0.35,
    radius: LAMP.radius * 2,
    projection,
  });
  const post = getIsoCylinder({
    center: lampBase,
    bottom: 0.35,
    top: LAMP.height,
    radius: LAMP.radius,
    projection,
  });
  const hydrant = getIsoCylinder({
    center: hydrantBase,
    bottom: 0,
    top: HYDRANT.height,
    radius: HYDRANT.radius,
    projection,
  });
  const hydrantCap = getIsoCylinder({
    center: hydrantBase,
    bottom: HYDRANT.height,
    top: HYDRANT.height + 0.08,
    radius: HYDRANT.radius * 0.7,
    topRadius: HYDRANT.radius * 0.4,
    projection,
  });
  const lights =
    timeOfDay === undefined
      ? []
      : getStreetLights({ timeOfDay, sky: config.sky });
  const lampOpacity = timeOfDay?.nightOpacity ?? 1;
  function shadowLine(options: {
    light: StreetLight;
    buildingShadowEdgeX: number;
    base: { x: number; y: number };
    height: number;
  }) {
    const { light } = options;
    if (options.base.x < options.buildingShadowEdgeX) return undefined;
    const length = Math.min(
      MAX_SHADOW_LENGTH,
      Math.hypot(light.shadow.x, light.shadow.y) * options.height
    );
    const scale = length / Math.hypot(light.shadow.x, light.shadow.y);
    const from = at(options.base.x, options.base.y, 0);
    const to = at(
      options.base.x + light.shadow.x * scale,
      options.base.y + light.shadow.y * scale,
      0
    );
    return { x1: from.x, y1: from.y, x2: to.x, y2: to.y };
  }
  const litStreet = lights.map((light) => {
    const buildingShadowEdgeX =
      wallX -
      config.street.oppositeDistance +
      Math.min(
        config.street.oppositeDistance,
        light.shadow.x * config.street.oppositeHeight
      );
    return {
      light,
      postShadow: shadowLine({
        light,
        buildingShadowEdgeX,
        base: lampBase,
        height: LAMP.height,
      }),
      hydrantShadow: shadowLine({
        light,
        buildingShadowEdgeX,
        base: hydrantBase,
        height: HYDRANT.height,
      }),
      buildingShadow: clipped({
        from: wallX - config.street.oppositeDistance,
        to: buildingShadowEdgeX,
      }),
      sunlit: clipped({ from: buildingShadowEdgeX, to: wallX }),
    };
  });

  return (
    <g data-street strokeLinejoin="round">
      <defs>
        <radialGradient id={`${id}-lamp`}>
          <stop offset={0} style={{ stopColor: "var(--lm-accent-hi)" }} />
          <stop
            offset={1}
            style={{ stopColor: "var(--lm-accent-hi)", stopOpacity: 0 }}
          />
        </radialGradient>
      </defs>
      <polygon className="fill-[var(--lm-recess)]" points={band(road)} />
      <g
        strokeWidth={1.2}
        className="stroke-[var(--lm-ink-hi)]"
        strokeOpacity={0.2}
      >
        <line
          {...(() => {
            const from = at(bikeLaneX, span.from, road.z);
            const to = at(bikeLaneX, span.to, road.z);
            return { x1: from.x, y1: from.y, x2: to.x, y2: to.y };
          })()}
        />
        {laneDashes.map((y) => {
          const from = at(laneX, y, road.z);
          const to = at(laneX, y + LANE_DASH.length, road.z);
          return <line key={y} x1={from.x} y1={from.y} x2={to.x} y2={to.y} />;
        })}
      </g>
      <ellipse
        {...manhole}
        className="fill-[var(--lm-wall)] stroke-[var(--lm-detail)]"
        strokeWidth={0.6}
      />
      <ellipse
        cx={manhole.cx}
        cy={manhole.cy}
        rx={manhole.rx * 0.72}
        ry={manhole.ry * 0.72}
        className="fill-none stroke-[var(--lm-detail)]"
        strokeWidth={0.5}
      />
      <polygon
        className="fill-[var(--lm-face)] stroke-[var(--lm-line)]"
        strokeWidth={0.6}
        points={band({ from: kerbX, to: kerbX + KERB_WIDTH, z: 0 })}
      />
      <polygon
        className="fill-[var(--lm-wall-2)] stroke-[var(--lm-line)]"
        strokeWidth={0.6}
        points={band({ from: kerbX + KERB_WIDTH, to: wallX, z: 0 })}
      />
      <g className="stroke-[var(--lm-detail)]" strokeWidth={0.5}>
        {kerbJoints.map((y) => {
          const from = at(kerbX, y, 0);
          const to = at(kerbX + KERB_WIDTH, y, 0);
          return <line key={y} x1={from.x} y1={from.y} x2={to.x} y2={to.y} />;
        })}
        {pavingJoints.map((y) => {
          const from = at(kerbX + KERB_WIDTH, y, 0);
          const to = at(wallX, y, 0);
          return <line key={y} x1={from.x} y1={from.y} x2={to.x} y2={to.y} />;
        })}
        {(() => {
          const x = kerbX + KERB_WIDTH + (SIDEWALK_WIDTH - KERB_WIDTH) / 2;
          const from = at(x, span.from, 0);
          const to = at(x, span.to, 0);
          return <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} />;
        })()}
      </g>
      <g className="pointer-events-none stroke-none">
        {[road, sidewalk].map((ground) => (
          <polygon
            key={ground.z}
            points={band(ground)}
            style={{
              fill: timeOfDay?.skyHorizon ?? config.sky.keys[0].horizon,
              opacity: AMBIENT_OPACITY,
              transition: glide,
            }}
          />
        ))}
        {litStreet.flatMap(({ light, sunlit }) =>
          sunlit.map((ground) => (
            <polygon
              key={`${light.key}-${ground.z}`}
              points={band(ground)}
              style={{
                fill: light.color,
                opacity: light.strength * LIGHT_TINT_OPACITY,
                transition: glide,
              }}
            />
          ))
        )}
        {litStreet.flatMap(({ light, buildingShadow }) =>
          buildingShadow.map((ground) => (
            <polygon
              key={`${light.key}-${ground.z}`}
              className="fill-black"
              points={band(ground)}
              style={{
                opacity: light.strength * SHADOW_OPACITY,
                transition: glide,
              }}
            />
          ))
        )}
        <ellipse
          {...lampPool}
          fill={`url(#${id}-lamp)`}
          style={{ opacity: lampOpacity * 0.55, transition: glide }}
        />
      </g>
      {litStreet.map(({ light, postShadow, hydrantShadow }) => (
        <g
          key={light.key}
          className="stroke-black"
          strokeLinecap="round"
          style={{
            opacity: light.strength * SHADOW_OPACITY,
            transition: glide,
          }}
        >
          {postShadow !== undefined && (
            <line {...postShadow} strokeWidth={LAMP.radius * 2 * unit} />
          )}
          {hydrantShadow !== undefined && (
            <line {...hydrantShadow} strokeWidth={HYDRANT.radius * 2 * unit} />
          )}
        </g>
      ))}
      <g className="stroke-[var(--lm-line)]" strokeWidth={0.75}>
        <CylinderSides body={hydrant.body} facets={hydrant.facets} />
        <ellipse {...hydrant.top} className="fill-[var(--lm-face-top)]" />
        <CylinderSides body={hydrantCap.body} facets={hydrantCap.facets} />
        <ellipse {...hydrantCap.top} className="fill-[var(--lm-face-top)]" />
        <CylinderSides body={collar.body} facets={collar.facets} />
        <ellipse {...collar.top} className="fill-[var(--lm-face-top)]" />
        <CylinderSides body={post.body} facets={post.facets} />
      </g>
    </g>
  );
}
