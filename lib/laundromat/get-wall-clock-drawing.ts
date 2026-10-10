import { getClockHandAngles } from "./get-clock-hand-angles";
import type { IsoProjection, ScreenPoint } from "./project-iso-point";
import { projectIsoPoint } from "./project-iso-point";
import type { IsoPoint } from "./scene-config";

const RIM_SEGMENTS = 48;
const HOUR_HAND_RATIO = 0.5;
const MINUTE_HAND_RATIO = 0.78;
const TICK_INNER_RATIO = 0.84;
const TICK_OUTER_RATIO = 0.94;

const WALL_AXES = {
  back: { right: { x: 1, y: 0 }, normal: "y" },
  left: { right: { x: 0, y: -1 }, normal: "x" },
} satisfies {
  [wall: string]: { right: { x: number; y: number }; normal: "x" | "y" };
};

export type ClockWall = keyof typeof WALL_AXES;

/** Return the projected rim, hour ticks and hands of a round clock of `radius` centred on `center` on the `wall` plane, showing fractional `hour`. */
export function getWallClockDrawing(options: {
  center: IsoPoint;
  radius: number;
  wall: ClockWall;
  hour: number;
  projection: IsoProjection;
}) {
  const { center, radius, projection } = options;
  const { right } = WALL_AXES[options.wall];
  function onDial(angleDeg: number, ratio: number): ScreenPoint {
    const angle = (angleDeg * Math.PI) / 180;
    const across = Math.sin(angle) * radius * ratio;
    return projectIsoPoint({
      point: {
        x: center.x + right.x * across,
        y: center.y + right.y * across,
        z: center.z + Math.cos(angle) * radius * ratio,
      },
      projection,
    });
  }
  const middle = onDial(0, 0);
  const { hourDeg, minuteDeg } = getClockHandAngles(options.hour);
  return {
    center: middle,
    rim: Array.from({ length: RIM_SEGMENTS }, (_, index) =>
      onDial((index / RIM_SEGMENTS) * 360, 1)
    ),
    ticks: Array.from({ length: 12 }, (_, index) => ({
      from: onDial(index * 30, TICK_INNER_RATIO),
      to: onDial(index * 30, TICK_OUTER_RATIO),
    })),
    hourHand: { from: middle, to: onDial(hourDeg, HOUR_HAND_RATIO) },
    minuteHand: { from: middle, to: onDial(minuteDeg, MINUTE_HAND_RATIO) },
  };
}
