import type { ClockWall } from "@/lib/laundromat/get-wall-clock-drawing";
import { getWallClockDrawing } from "@/lib/laundromat/get-wall-clock-drawing";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import type { IsoPoint } from "@/lib/laundromat/scene-config";
import { toSvgPoints } from "@/lib/laundromat/to-svg-points";

type WallClockProps = {
  center: IsoPoint;
  radius: number;
  wall: ClockWall;
  hour: number;
  projection: IsoProjection;
};

export function WallClock(props: WallClockProps) {
  const drawing = getWallClockDrawing({
    center: props.center,
    radius: props.radius,
    wall: props.wall,
    hour: props.hour,
    projection: props.projection,
  });
  return (
    <g
      data-wall-clock
      strokeLinecap="round"
      className="[&_*]:[vector-effect:non-scaling-stroke]"
    >
      <polygon
        className="fill-[var(--lm-recess)] stroke-[var(--lm-line)]"
        strokeWidth={1}
        points={toSvgPoints(drawing.rim)}
      />
      <g className="stroke-[var(--lm-detail)]" strokeWidth={1}>
        {drawing.ticks.map((tick) => (
          <line
            key={`${tick.to.x},${tick.to.y}`}
            x1={tick.from.x}
            y1={tick.from.y}
            x2={tick.to.x}
            y2={tick.to.y}
          />
        ))}
      </g>
      <g className="stroke-[var(--lm-ink-hi)]">
        <line
          strokeWidth={2}
          x1={drawing.hourHand.from.x}
          y1={drawing.hourHand.from.y}
          x2={drawing.hourHand.to.x}
          y2={drawing.hourHand.to.y}
        />
        <line
          strokeWidth={1.25}
          x1={drawing.minuteHand.from.x}
          y1={drawing.minuteHand.from.y}
          x2={drawing.minuteHand.to.x}
          y2={drawing.minuteHand.to.y}
        />
      </g>
      <circle
        className="fill-[var(--lm-ink-hi)]"
        cx={drawing.center.x}
        cy={drawing.center.y}
        r={1.5}
      />
    </g>
  );
}
