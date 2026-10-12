import { useId } from "react";

import type { LaidOutObject } from "@/lib/laundromat/build-scene-layout";
import type { TimeOfDay } from "@/lib/laundromat/get-time-of-day";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import { projectIsoPoint } from "@/lib/laundromat/project-iso-point";
import type { SceneConfig } from "@/lib/laundromat/scene-config";
import { toSvgPoints } from "@/lib/laundromat/to-svg-points";

const FILL_RADIUS_RATIO = 0.75;

type RoomDaylightFillProps = {
  window: LaidOutObject;
  timeOfDay: TimeOfDay;
  projection: IsoProjection;
  size: { width: number; height: number };
  config: SceneConfig;
};

/** Draw the daylight that the window spreads through the room as a soft glow centred on the window, clipped to the room and scaled by `timeOfDay.daylight`. */
export function RoomDaylightFill(props: RoomDaylightFillProps) {
  const id = useId();
  const { config, timeOfDay } = props;
  const { width, depth, wallHeight } = config.room;
  const { position, size } = props.window.object;
  const center = projectIsoPoint({
    point: {
      x: position.x,
      y: position.y + size.d / 2,
      z: position.z + size.h / 2,
    },
    projection: props.projection,
  });
  const outline = [
    { x: 0, y: depth, z: 0 },
    { x: 0, y: depth, z: wallHeight },
    { x: 0, y: 0, z: wallHeight },
    { x: width, y: 0, z: wallHeight },
    { x: width, y: 0, z: 0 },
    { x: width, y: depth, z: 0 },
  ].map((point) => projectIsoPoint({ point, projection: props.projection }));
  const radius =
    Math.max(props.size.width, props.size.height) * FILL_RADIUS_RATIO;
  return (
    <g data-room-daylight-fill className="pointer-events-none">
      <defs>
        <radialGradient
          id={`${id}-fill`}
          gradientUnits="userSpaceOnUse"
          cx={center.x}
          cy={center.y}
          r={radius}
        >
          <stop offset={0} stopColor={timeOfDay.daylightPatchColor} />
          <stop
            offset={0.4}
            stopColor={timeOfDay.daylightPatchColor}
            stopOpacity={0.45}
          />
          <stop
            offset={1}
            stopColor={timeOfDay.daylightPatchColor}
            stopOpacity={0}
          />
        </radialGradient>
        <clipPath id={`${id}-room`}>
          <polygon points={toSvgPoints(outline)} />
        </clipPath>
      </defs>
      <rect
        width={props.size.width}
        height={props.size.height}
        clipPath={`url(#${id}-room)`}
        fill={`url(#${id}-fill)`}
        style={{
          opacity: timeOfDay.daylight * config.light.daylightFillOpacity,
          transition: `opacity ${config.sky.timeJumpGlideMs}ms`,
        }}
      />
    </g>
  );
}
