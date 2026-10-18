import { getFacePlane } from "@/lib/laundromat/get-face-plane";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import { projectIsoPoint } from "@/lib/laundromat/project-iso-point";
import type { IsoPoint, IsoSize } from "@/lib/laundromat/scene-config";
import { toSvgPoints } from "@/lib/laundromat/to-svg-points";

import { partStroke } from "./part-stroke";

const LEDGE_DEPTH = 0.06;
const LEDGE_HEIGHT = 0.29;
const FLAT_TOP_DEPTH = 0.5;
const BACK_FOOT_HEIGHT = 0.41;
const STRIPE_COLORS = ["#d9473b", "#ee8a2f", "#f2c53d", "#5aa957", "#3f86c6"];
const SHUTTER_COLOR = "#e2452f";

const BODY_FILLS = {
  top: "fill-[color-mix(in_srgb,var(--lm-paper)_64%,var(--lm-face-top))]",
  slope: "fill-[color-mix(in_srgb,var(--lm-paper)_56%,var(--lm-face-top))]",
  front: "fill-[color-mix(in_srgb,var(--lm-paper)_52%,var(--lm-face))]",
  ledge: "fill-[color-mix(in_srgb,var(--lm-paper)_58%,var(--lm-face-top))]",
  lowerFront: "fill-[color-mix(in_srgb,var(--lm-paper)_44%,var(--lm-face))]",
  side: "fill-[color-mix(in_srgb,var(--lm-paper)_34%,var(--lm-wall))]",
} as const;

type InstantCameraDrawingProps = {
  laidOut: { object: { position: IsoPoint; size: IsoSize } };
  projection: IsoProjection;
  highlighted: boolean;
};

/** Draw an instant camera standing on its base with the lens facing +y: a film ledge with the print slot, a sloped back, a viewfinder hump, flash, red shutter button and a colour stripe above the lens. */
export function InstantCameraDrawing(props: InstantCameraDrawingProps) {
  const { position: p, size } = props.laidOut.object;
  const { projection } = props;
  const { unit } = projection;
  const ledge = size.d * LEDGE_DEPTH;
  const lipZ = size.h * LEDGE_HEIGHT;
  const topBackDepth = ledge + (size.d - ledge) * FLAT_TOP_DEPTH;
  const backFootZ = size.h * BACK_FOOT_HEIGHT;
  const hump = {
    fromDepth: ledge + (topBackDepth - ledge) * 0.15,
    toDepth: ledge + (topBackDepth - ledge) * 0.9,
    fromX: size.w * 0.66,
    toX: size.w * 0.93,
    height: size.h * 0.26,
  };

  function at(options: { across: number; depth: number; up: number }) {
    return projectIsoPoint({
      point: {
        x: p.x + options.across,
        y: p.y + size.d - options.depth,
        z: p.z + options.up,
      },
      projection,
    });
  }
  function points(list: [number, number, number][]) {
    return toSvgPoints(
      list.map(([across, depth, up]) => at({ across, depth, up }))
    );
  }

  const front = getFacePlane({
    plane: "front",
    origin: { x: p.x, y: p.y + size.d - ledge, z: p.z + size.h },
    projection,
  });
  const ledgeFront = getFacePlane({
    plane: "front",
    origin: { x: p.x, y: p.y + size.d, z: p.z + lipZ },
    projection,
  });
  const faceWidth = size.w * unit;
  const faceHeight = (size.h - lipZ) * unit;
  const lens = { cx: faceWidth * 0.5, cy: faceHeight * 0.53 };
  const lensRadius = faceWidth * 0.22;
  const flashRadius = faceWidth * 0.115;
  const stripeWidth = faceWidth * 0.036;

  return (
    <g
      data-instant-camera
      className={partStroke(props.highlighted)}
      strokeWidth={1}
      strokeLinejoin="round"
    >
      <polygon
        className={BODY_FILLS.slope}
        points={points([
          [0, topBackDepth, size.h],
          [size.w, topBackDepth, size.h],
          [size.w, size.d, backFootZ],
          [0, size.d, backFootZ],
        ])}
      />
      <polygon
        className={BODY_FILLS.side}
        points={points([
          [size.w, 0, 0],
          [size.w, size.d, 0],
          [size.w, size.d, backFootZ],
          [size.w, topBackDepth, size.h],
          [size.w, ledge, size.h],
          [size.w, ledge, lipZ],
          [size.w, 0, lipZ],
        ])}
      />
      <polygon
        className={BODY_FILLS.top}
        points={points([
          [0, ledge, size.h],
          [size.w, ledge, size.h],
          [size.w, topBackDepth, size.h],
          [0, topBackDepth, size.h],
        ])}
      />
      <polygon
        className={BODY_FILLS.side}
        points={points([
          [hump.toX, hump.fromDepth, size.h],
          [hump.toX, hump.toDepth, size.h],
          [hump.toX, hump.toDepth, size.h + hump.height],
          [hump.toX, hump.fromDepth, size.h + hump.height],
        ])}
      />
      <polygon
        className={BODY_FILLS.top}
        points={points([
          [hump.fromX, hump.fromDepth, size.h + hump.height],
          [hump.toX, hump.fromDepth, size.h + hump.height],
          [hump.toX, hump.toDepth, size.h + hump.height],
          [hump.fromX, hump.toDepth, size.h + hump.height],
        ])}
      />
      <polygon
        className={BODY_FILLS.front}
        points={points([
          [hump.fromX, hump.fromDepth, size.h],
          [hump.toX, hump.fromDepth, size.h],
          [hump.toX, hump.fromDepth, size.h + hump.height],
          [hump.fromX, hump.fromDepth, size.h + hump.height],
        ])}
      />
      <polygon
        className="fill-[var(--lm-recess)] stroke-none"
        points={points([
          [hump.fromX + size.w * 0.05, hump.fromDepth, size.h + size.h * 0.06],
          [hump.toX - size.w * 0.05, hump.fromDepth, size.h + size.h * 0.06],
          [
            hump.toX - size.w * 0.05,
            hump.fromDepth,
            size.h + hump.height * 0.75,
          ],
          [
            hump.fromX + size.w * 0.05,
            hump.fromDepth,
            size.h + hump.height * 0.75,
          ],
        ])}
      />
      <polygon
        className={BODY_FILLS.front}
        points={points([
          [0, ledge, lipZ],
          [size.w, ledge, lipZ],
          [size.w, ledge, size.h],
          [0, ledge, size.h],
        ])}
      />
      <polygon
        className={BODY_FILLS.ledge}
        points={points([
          [0, 0, lipZ],
          [size.w, 0, lipZ],
          [size.w, ledge, lipZ],
          [0, ledge, lipZ],
        ])}
      />
      <polygon
        className={BODY_FILLS.lowerFront}
        points={points([
          [0, 0, 0],
          [size.w, 0, 0],
          [size.w, 0, lipZ],
          [0, 0, lipZ],
        ])}
      />
      <g transform={ledgeFront.transform}>
        <rect
          x={faceWidth * 0.14}
          y={lipZ * unit * 0.45}
          width={faceWidth * 0.72}
          height={lipZ * unit * 0.2}
          rx={lipZ * unit * 0.1}
          className="fill-[var(--lm-recess)] stroke-none"
        />
      </g>
      <g transform={front.transform}>
        <g className="stroke-none">
          {STRIPE_COLORS.map((color, index) => (
            <rect
              key={color}
              x={lens.cx - stripeWidth * 2.5 + index * stripeWidth}
              y={0}
              width={stripeWidth}
              height={faceHeight * 0.17}
              fill={color}
              opacity={0.85}
            />
          ))}
        </g>
        <circle
          cx={faceWidth * 0.21}
          cy={faceHeight * 0.3}
          r={flashRadius}
          className="fill-[color-mix(in_srgb,var(--lm-paper)_72%,var(--lm-face-top))] stroke-[var(--lm-detail)]"
          strokeWidth={0.6}
        />
        <circle
          cx={faceWidth * 0.21}
          cy={faceHeight * 0.3}
          r={flashRadius * 0.6}
          className="fill-none stroke-[var(--lm-detail)]"
          strokeWidth={0.4}
        />
        <circle
          cx={faceWidth * 0.21}
          cy={faceHeight * 0.72}
          r={faceWidth * 0.066}
          fill={SHUTTER_COLOR}
          className="stroke-none"
        />
        <rect
          x={faceWidth * 0.75}
          y={faceHeight * 0.14}
          width={faceWidth * 0.16}
          height={faceHeight * 0.3}
          rx={1}
          className="fill-[var(--lm-recess)] stroke-[var(--lm-detail)]"
          strokeWidth={0.5}
        />
        <rect
          x={faceWidth * 0.77}
          y={faceHeight * 0.55}
          width={faceWidth * 0.11}
          height={faceHeight * 0.06}
          rx={0.5}
          className="fill-[var(--lm-detail)] stroke-none"
        />
        <circle
          cx={lens.cx}
          cy={lens.cy}
          r={lensRadius}
          className="fill-[color-mix(in_srgb,var(--lm-paper)_66%,var(--lm-face-top))]"
        />
        <circle
          cx={lens.cx}
          cy={lens.cy}
          r={lensRadius * 0.75}
          className="fill-[var(--lm-recess)] stroke-[var(--lm-detail)]"
          strokeWidth={0.5}
        />
        <circle
          cx={lens.cx}
          cy={lens.cy}
          r={lensRadius * 0.44}
          fill="#1f3b4d"
          className="stroke-none"
        />
        <circle
          cx={lens.cx - lensRadius * 0.15}
          cy={lens.cy - lensRadius * 0.15}
          r={lensRadius * 0.14}
          fill="#8fb7cf"
          opacity={0.75}
          className="stroke-none"
        />
      </g>
    </g>
  );
}
