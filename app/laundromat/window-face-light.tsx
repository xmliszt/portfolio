import { useId } from "react";

import type { LaidOutObject } from "@/lib/laundromat/build-scene-layout";
import { getBoxFaces } from "@/lib/laundromat/get-box-faces";
import { getWindowFrontLight } from "@/lib/laundromat/get-window-front-light";
import type { WindowLight } from "@/lib/laundromat/get-window-lights";
import { hasFlatFront } from "@/lib/laundromat/has-flat-front";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import { projectIsoPoint } from "@/lib/laundromat/project-iso-point";
import { toSvgPoints } from "@/lib/laundromat/to-svg-points";

const BLUR_PX = 2;
const FACE_OPACITY = 0.6;

type WindowFaceLightProps = {
  laidOut: LaidOutObject;
  light: WindowLight;
  projection: IsoProjection;
  glideMs: number;
};

/** Draw the window's light where it lands on the front face of a washer, dryer or counter, clipped to that face. */
export function WindowFaceLight(props: WindowFaceLightProps) {
  const id = useId();
  const { position, size } = props.laidOut.object;
  const corners = hasFlatFront(props.laidOut.object.kind)
    ? getWindowFrontLight({
        opening: props.light.opening,
        shadow: props.light.shadow,
        frontY: position.y + size.d,
      })
    : undefined;
  if (corners === undefined) return null;
  const front = getBoxFaces({
    position,
    size,
    projection: props.projection,
  }).front;
  const points = corners.map((point) =>
    projectIsoPoint({ point, projection: props.projection })
  );
  return (
    <g className="pointer-events-none">
      <defs>
        <clipPath id={`${id}-face`}>
          <polygon points={toSvgPoints(front)} />
        </clipPath>
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
      <g clipPath={`url(#${id}-face)`}>
        <polygon
          fill={props.light.color}
          filter={`url(#${id}-soften)`}
          points={toSvgPoints(points)}
          style={{
            opacity: props.light.opacity * FACE_OPACITY,
            transition: `opacity ${props.glideMs}ms`,
          }}
        />
      </g>
    </g>
  );
}
