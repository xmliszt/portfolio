import { useId } from "react";

import type { TimeOfDay } from "@/lib/laundromat/get-time-of-day";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import { projectIsoPoint } from "@/lib/laundromat/project-iso-point";
import type { SceneConfig } from "@/lib/laundromat/scene-config";
import { toSvgPoints } from "@/lib/laundromat/to-svg-points";

const GLOW_CENTER_HEIGHT_RATIO = 0.3;
const GLOW_RADIUS_RATIO = 0.55;

type RoomLampGlowProps = {
  timeOfDay: TimeOfDay;
  projection: IsoProjection;
  size: { width: number; height: number };
  config: SceneConfig;
};

/** Draw the ceiling lamp's warm glow and wall falloff, clipped to the room and scaled by `timeOfDay.lampIntensity`. */
export function RoomLampGlow(props: RoomLampGlowProps) {
  const id = useId();
  const { config, timeOfDay } = props;
  const { width, depth, wallHeight } = config.room;
  const center = projectIsoPoint({
    point: {
      x: width / 2,
      y: depth / 2,
      z: wallHeight * GLOW_CENTER_HEIGHT_RATIO,
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
    Math.max(props.size.width, props.size.height) * GLOW_RADIUS_RATIO;
  const transition = `opacity ${config.sky.timeJumpGlideMs}ms`;
  return (
    <g data-room-lamp-glow className="lm-lamp pointer-events-none">
      <defs>
        <radialGradient
          id={`${id}-glow`}
          gradientUnits="userSpaceOnUse"
          cx={center.x}
          cy={center.y}
          r={radius}
        >
          <stop offset={0} stopColor={config.light.lampColor} stopOpacity={1} />
          <stop
            offset={0.35}
            stopColor={config.light.lampColor}
            stopOpacity={0.45}
          />
          <stop
            offset={0.75}
            stopColor={config.light.lampColor}
            stopOpacity={0}
          />
        </radialGradient>
        <radialGradient
          id={`${id}-falloff`}
          gradientUnits="userSpaceOnUse"
          cx={center.x}
          cy={center.y}
          r={radius}
        >
          <stop offset={0.4} stopColor="#000" stopOpacity={0} />
          <stop offset={1} stopColor="#000" stopOpacity={1} />
        </radialGradient>
        <clipPath id={`${id}-room`}>
          <polygon points={toSvgPoints(outline)} />
        </clipPath>
      </defs>
      <rect
        width={props.size.width}
        height={props.size.height}
        clipPath={`url(#${id}-room)`}
        fill={`url(#${id}-glow)`}
        style={{
          opacity: timeOfDay.lampIntensity * config.light.lampGlowOpacity,
          transition,
        }}
      />
      <rect
        width={props.size.width}
        height={props.size.height}
        clipPath={`url(#${id}-room)`}
        fill={`url(#${id}-falloff)`}
        style={{
          opacity: timeOfDay.lampIntensity * config.light.lampFalloffOpacity,
          transition,
        }}
      />
    </g>
  );
}
