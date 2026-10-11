import { useId } from "react";

import type { ScreenPoint } from "@/lib/laundromat/project-iso-point";
import { toSvgPoints } from "@/lib/laundromat/to-svg-points";

const BLUR_PX = 7;

type DaylightPatchProps = {
  points: ScreenPoint[];
  color: string;
  opacity: number;
  glideMs: number;
};

function midpoint(from: ScreenPoint, to: ScreenPoint) {
  return { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
}

/** Draw the window's light on the floor as a blurred quad from `points` (wall edge first) that fades out away from the wall. */
export function DaylightPatch(props: DaylightPatchProps) {
  const id = useId();
  const [wallStart, wallEnd, farEnd, farStart] = props.points;
  const from = midpoint(wallStart, wallEnd);
  const to = midpoint(farStart, farEnd);
  const glide = `${props.glideMs}ms`;
  return (
    <g className="pointer-events-none">
      <defs>
        <linearGradient
          id={`${id}-fade`}
          gradientUnits="userSpaceOnUse"
          x1={from.x}
          y1={from.y}
          x2={to.x}
          y2={to.y}
        >
          <stop offset={0} stopColor={props.color} stopOpacity={0.9} />
          <stop offset={0.45} stopColor={props.color} stopOpacity={0.55} />
          <stop offset={1} stopColor={props.color} stopOpacity={0} />
        </linearGradient>
        <filter
          id={`${id}-soften`}
          x="-30%"
          y="-30%"
          width="160%"
          height="160%"
        >
          <feGaussianBlur stdDeviation={BLUR_PX} />
        </filter>
      </defs>
      <polygon
        fill={`url(#${id}-fade)`}
        filter={`url(#${id}-soften)`}
        points={toSvgPoints(props.points)}
        style={{
          opacity: props.opacity,
          transition: `opacity ${glide}`,
        }}
      />
    </g>
  );
}
