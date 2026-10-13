import { useId } from "react";

import type { ScreenPoint } from "@/lib/laundromat/project-iso-point";
import { toSvgPoints } from "@/lib/laundromat/to-svg-points";

import { useRenderQuality } from "./settings/use-render-quality";

const BLUR_PX = 7;

type DaylightPatchProps = {
  points: ScreenPoint[];
  shadows?: { key: string; points: ScreenPoint[] }[];
  color: string;
  opacity: number;
  glideMs: number;
};

function midpoint(from: ScreenPoint, to: ScreenPoint) {
  return { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
}

/** Draw the window's light on the floor as a blurred quad from `points` (wall edge first) that fades out away from the wall, cut by the `shadows` polygons. */
export function DaylightPatch(props: DaylightPatchProps) {
  const id = useId();
  const { quality } = useRenderQuality();
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
        {props.shadows !== undefined && (
          <mask id={`${id}-shadows`}>
            <polygon fill="white" points={toSvgPoints(props.points)} />
            {props.shadows.map((shadow) => (
              <polygon
                key={shadow.key}
                fill="black"
                points={toSvgPoints(shadow.points)}
              />
            ))}
          </mask>
        )}
      </defs>
      <g
        filter={quality === "full" ? `url(#${id}-soften)` : undefined}
        style={{
          opacity: props.opacity,
          transition: `opacity ${glide}`,
        }}
      >
        <polygon
          fill={`url(#${id}-fade)`}
          mask={props.shadows === undefined ? undefined : `url(#${id}-shadows)`}
          points={toSvgPoints(props.points)}
        />
      </g>
    </g>
  );
}
