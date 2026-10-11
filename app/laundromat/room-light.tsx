import { useId } from "react";

import type { LaidOutObject } from "@/lib/laundromat/build-scene-layout";
import { getDaylightPatch } from "@/lib/laundromat/get-daylight-patch";
import type { TimeOfDay } from "@/lib/laundromat/get-time-of-day";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import { projectIsoPoint } from "@/lib/laundromat/project-iso-point";
import type { SceneConfig } from "@/lib/laundromat/scene-config";
import { toSvgPoints } from "@/lib/laundromat/to-svg-points";

import { DaylightPatch } from "./daylight-patch";

const POOL_SEGMENTS = 48;
const POOL_RADIUS_RATIO = 0.36;
const POOL_PEAK_OPACITY = 0.14;
const DAYLIGHT_PATCH_REACH = 2.6;

type RoomLightProps = {
  window: LaidOutObject | undefined;
  timeOfDay: TimeOfDay;
  projection: IsoProjection;
  config: SceneConfig;
};

export function RoomLight(props: RoomLightProps) {
  const id = useId();
  const { projection, timeOfDay, config } = props;
  const { width, depth } = config.room;
  const glide = { transition: `opacity ${config.sky.timeJumpGlideMs}ms` };

  function onFloor(x: number, y: number) {
    return projectIsoPoint({ point: { x, y, z: 0 }, projection });
  }

  const poolRadius = Math.min(width, depth) * POOL_RADIUS_RATIO;
  const pool = Array.from({ length: POOL_SEGMENTS }, (_, index) => {
    const angle = (index / POOL_SEGMENTS) * Math.PI * 2;
    return onFloor(
      width / 2 + Math.cos(angle) * poolRadius,
      depth / 2 + Math.sin(angle) * poolRadius
    );
  });

  const daylightPatch = (() => {
    if (props.window === undefined) return undefined;
    const { position, size } = props.window.object;
    return getDaylightPatch({
      wallX: position.x + size.w,
      fromY: position.y,
      toY: position.y + size.d,
      reach: DAYLIGHT_PATCH_REACH,
      sun: timeOfDay.sun,
    }).map((point) => onFloor(point.x, point.y));
  })();

  return (
    <g data-room-light className="pointer-events-none">
      <defs>
        <radialGradient id={`${id}-pool`}>
          <stop offset={0} stopColor={config.light.lampColor} />
          <stop offset={1} stopColor={config.light.lampColor} stopOpacity={0} />
        </radialGradient>
      </defs>
      <g className="lm-lamp">
        <polygon
          fill={`url(#${id}-pool)`}
          points={toSvgPoints(pool)}
          style={{
            opacity: timeOfDay.lampIntensity * POOL_PEAK_OPACITY,
            ...glide,
          }}
        />
      </g>
      {daylightPatch !== undefined && (
        <DaylightPatch
          points={daylightPatch}
          color={timeOfDay.daylightPatchColor}
          opacity={timeOfDay.daylightPatchOpacity}
          glideMs={config.sky.timeJumpGlideMs}
        />
      )}
    </g>
  );
}
