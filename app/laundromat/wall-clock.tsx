import type { ClockWall } from "@/lib/laundromat/get-wall-clock-drawing";
import { getWallClockDrawing } from "@/lib/laundromat/get-wall-clock-drawing";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import type { IsoPoint, SceneConfig } from "@/lib/laundromat/scene-config";
import { toSvgPoints } from "@/lib/laundromat/to-svg-points";

const WALL_NORMALS = {
  back: { x: 0, y: 1 },
  left: { x: 1, y: 0 },
};

const GLASS_HIGHLIGHT_SEGMENTS = { from: 34, to: 42 };

type WallClockProps = {
  center: IsoPoint;
  depth: number;
  radius: number;
  wall: ClockWall;
  hour: number;
  projection: IsoProjection;
  details: SceneConfig["details"]["clock"];
};

export function WallClock(props: WallClockProps) {
  const normal = WALL_NORMALS[props.wall];
  const drawing = getWallClockDrawing({
    center: props.center,
    radius: props.radius,
    wall: props.wall,
    hour: props.hour,
    projection: props.projection,
  });
  const backPlate = getWallClockDrawing({
    center: {
      x: props.center.x - normal.x * props.depth,
      y: props.center.y - normal.y * props.depth,
      z: props.center.z,
    },
    radius: props.radius * 1.04,
    wall: props.wall,
    hour: props.hour,
    projection: props.projection,
  });
  const band = drawing.rim.map((point, index) => {
    const next = (index + 1) % drawing.rim.length;
    return [
      backPlate.rim[index],
      backPlate.rim[next],
      drawing.rim[next],
      point,
    ];
  });
  const glassHighlight = drawing.rim.slice(
    GLASS_HIGHLIGHT_SEGMENTS.from,
    GLASS_HIGHLIGHT_SEGMENTS.to
  );
  return (
    <g
      data-wall-clock
      strokeLinecap="round"
      strokeLinejoin="round"
      className="[&_*]:[vector-effect:non-scaling-stroke]"
    >
      <polygon
        className="fill-[var(--lm-wall-2)] stroke-[var(--lm-line)]"
        strokeWidth={1}
        points={toSvgPoints(backPlate.rim)}
      />
      {band.map((quad) => (
        <polygon
          key={`${quad[0].x},${quad[0].y}`}
          className="fill-[var(--lm-face)] stroke-[var(--lm-face)]"
          strokeWidth={0.5}
          points={toSvgPoints(quad)}
        />
      ))}
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
          strokeWidth={props.details.hourHandWidth}
          x1={drawing.hourHand.from.x}
          y1={drawing.hourHand.from.y}
          x2={drawing.hourHand.to.x}
          y2={drawing.hourHand.to.y}
        />
        <line
          strokeWidth={props.details.minuteHandWidth}
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
      <polyline
        className="fill-none stroke-[var(--lm-ink-hi)]"
        strokeOpacity={props.details.glassHighlight}
        strokeWidth={1.5}
        points={toSvgPoints(glassHighlight)}
      />
    </g>
  );
}
