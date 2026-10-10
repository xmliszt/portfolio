import { useId } from "react";

import type { LaidOutObject } from "@/lib/laundromat/build-scene-layout";
import type { TimeOfDay } from "@/lib/laundromat/get-time-of-day";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import { projectIsoPoint } from "@/lib/laundromat/project-iso-point";
import type { SceneConfig } from "@/lib/laundromat/scene-config";
import { toSvgPoints } from "@/lib/laundromat/to-svg-points";

const SUN_RADIUS = 0.3;
const MOON_RADIUS = 0.22;
const MOON_AT = { across: 0.3, up: 0.78 };
const STARS = [
  { across: 0.12, up: 0.9 },
  { across: 0.48, up: 0.92 },
  { across: 0.62, up: 0.7 },
  { across: 0.82, up: 0.86 },
  { across: 0.22, up: 0.6 },
  { across: 0.9, up: 0.62 },
];

type WindowSkyProps = {
  laidOut: LaidOutObject;
  timeOfDay: TimeOfDay;
  projection: IsoProjection;
  sky: SceneConfig["sky"];
};

export function WindowSky(props: WindowSkyProps) {
  const id = useId();
  const { position, size } = props.laidOut.object;
  const { timeOfDay, projection } = props;
  const glide = {
    transition: `stop-color ${props.sky.timeJumpGlideMs}ms, opacity ${props.sky.timeJumpGlideMs}ms`,
  };

  function onPane(options: { across: number; up: number }) {
    return projectIsoPoint({
      point: {
        x: position.x + size.w,
        y: position.y + size.d * (1 - options.across),
        z: position.z + size.h * options.up,
      },
      projection,
    });
  }

  const moon = onPane(MOON_AT);
  const sun =
    timeOfDay.sun === undefined
      ? undefined
      : {
          center: onPane({
            across: 0.1 + 0.8 * timeOfDay.sun.progress,
            up: 0.08 + 0.72 * timeOfDay.sun.elevation,
          }),
          color: timeOfDay.sun.color,
        };

  return (
    <g data-window-sky>
      <defs>
        <linearGradient id={`${id}-sky`} x1={0} y1={0} x2={0} y2={1}>
          <stop offset={0} style={{ stopColor: timeOfDay.skyTop, ...glide }} />
          <stop
            offset={1}
            style={{ stopColor: timeOfDay.skyHorizon, ...glide }}
          />
        </linearGradient>
        <clipPath id={`${id}-pane`}>
          <polygon points={toSvgPoints(props.laidOut.faces.side)} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-pane)`}>
        <polygon
          fill={`url(#${id}-sky)`}
          points={toSvgPoints(props.laidOut.faces.side)}
        />
        <g style={{ opacity: timeOfDay.nightOpacity, ...glide }}>
          {STARS.map((star) => {
            const point = onPane(star);
            return (
              <circle
                key={`${star.across},${star.up}`}
                cx={point.x}
                cy={point.y}
                r={0.8}
                fill={props.sky.starColor}
              />
            );
          })}
          <circle
            cx={moon.x}
            cy={moon.y}
            r={MOON_RADIUS * projection.unit}
            fill={props.sky.moonColor}
          />
        </g>
        {sun !== undefined && (
          <circle
            cx={sun.center.x}
            cy={sun.center.y}
            r={SUN_RADIUS * projection.unit}
            fill={sun.color}
          />
        )}
      </g>
      <polygon
        className="fill-none stroke-[var(--lm-line)] [vector-effect:non-scaling-stroke]"
        strokeWidth={1}
        strokeLinejoin="round"
        points={toSvgPoints(props.laidOut.faces.side)}
      />
    </g>
  );
}
