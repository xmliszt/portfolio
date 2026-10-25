import { getRoomDarkness } from "@/lib/laundromat/get-room-darkness";
import { getStreetLights } from "@/lib/laundromat/get-street-lights";
import type { TimeOfDay } from "@/lib/laundromat/get-time-of-day";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import { projectIsoPoint } from "@/lib/laundromat/project-iso-point";
import type { SceneConfig } from "@/lib/laundromat/scene-config";
import { toSvgPoints } from "@/lib/laundromat/to-svg-points";

type RoomDarknessVeilProps = {
  timeOfDay: TimeOfDay;
  projection: IsoProjection;
  config: SceneConfig;
};

/** Darken the shop's walls, floor and everything in it by `getRoomDarkness` of the sun and moon through the window and the lamp's share of `config.light.poolIntensity`. */
export function RoomDarknessVeil(props: RoomDarknessVeilProps) {
  const { config, timeOfDay } = props;
  const { width, depth, wallHeight } = config.room;
  const windowStrength = getStreetLights({
    timeOfDay,
    sky: config.sky,
  }).reduce((sum, light) => sum + light.strength, 0);
  const opacity = getRoomDarkness({
    windowStrength,
    lampLevel:
      config.light.poolIntensity > 0
        ? timeOfDay.lampIntensity / config.light.poolIntensity
        : 0,
  });
  const outline = [
    { x: 0, y: depth, z: 0 },
    { x: 0, y: depth, z: wallHeight },
    { x: 0, y: 0, z: wallHeight },
    { x: width, y: 0, z: wallHeight },
    { x: width, y: 0, z: 0 },
    { x: width, y: depth, z: 0 },
  ].map((point) => projectIsoPoint({ point, projection: props.projection }));
  return (
    <polygon
      data-room-darkness
      className="pointer-events-none"
      fill="black"
      points={toSvgPoints(outline)}
      style={{
        opacity: opacity * config.light.darknessScale,
        transition: `opacity ${config.sky.timeJumpGlideMs}ms`,
      }}
    />
  );
}
