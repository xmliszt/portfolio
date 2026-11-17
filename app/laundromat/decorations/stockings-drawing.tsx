import { useId } from "react";

import { getColorShades } from "@/lib/laundromat/decorations/get-color-shades";
import { getFacePlane } from "@/lib/laundromat/get-face-plane";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import type {
  SceneConfig,
  SceneDecoration,
} from "@/lib/laundromat/scene-config";

import { useDecorationPose } from "./use-decoration-pose";

const STOCKING_COUNT = 3;
const CUFF_TUFTS = 5;
const DEPTH_LAYERS = 8;

type StockingsDrawingProps = {
  reaction?: number;
  reactionSettings: SceneConfig["details"]["decorationReaction"];
  object: Extract<SceneDecoration, { kind: "stockings" }>;
  projection: IsoProjection;
  details: SceneConfig["details"]["christmas"];
};

export function StockingsDrawing(props: StockingsDrawingProps) {
  const id = useId();
  const { pose, progress, reducedMotion } = useDecorationPose({
    reaction: props.reaction,
    durationMs: props.reactionSettings.durationMs,
  });
  const { position, size } = props.object;
  const { unit } = props.projection;
  const { needle, bauble, gold, snow } = props.details;
  const face = getFacePlane({
    plane: "side",
    origin: {
      x: position.x + size.w,
      y: position.y + size.d,
      z: position.z + size.h,
    },
    projection: props.projection,
  });
  const spacing = (size.d * unit) / STOCKING_COUNT;
  const s = spacing * 0.36;
  const l = size.h * unit;
  const leg = `M${-0.42 * s},${0.26 * l} L${-0.42 * s},${0.64 * l} C${-0.42 * s},${0.72 * l} ${-0.7 * s},${0.75 * l} ${-0.95 * s},${0.8 * l} C${-1.25 * s},${0.86 * l} ${-1.15 * s},${l} ${-0.8 * s},${l} L${0.15 * s},${l} C${0.48 * s},${l} ${0.5 * s},${0.84 * l} ${0.42 * s},${0.68 * l} L${0.42 * s},${0.26 * l}Z`;
  const toe = `M${-0.8 * s},${l} C${-1.15 * s},${l} ${-1.25 * s},${0.86 * l} ${-0.95 * s},${0.8 * l} Q${-0.72 * s},${0.9 * l} ${-0.8 * s},${l}Z`;
  const felts = [bauble, needle, bauble];
  const cuff = {
    left: -0.52 * s,
    right: 0.52 * s,
    top: 0.07 * l,
    bottom: 0.27 * l,
  };
  const tuft = (cuff.right - cuff.left) / CUFF_TUFTS;
  const tuftRadius = tuft / 2;
  const cuffPath = [
    `M${cuff.left},${cuff.top + 0.03 * l}`,
    ...Array.from(
      { length: CUFF_TUFTS },
      (_, index) =>
        `A${tuftRadius},${0.03 * l} 0 0 1 ${cuff.left + tuft * (index + 1)},${cuff.top + 0.03 * l}`
    ),
    `L${cuff.right},${cuff.bottom - 0.03 * l}`,
    ...Array.from(
      { length: CUFF_TUFTS },
      (_, index) =>
        `A${tuftRadius},${0.035 * l} 0 0 1 ${cuff.right - tuft * (index + 1)},${cuff.bottom - 0.03 * l}`
    ),
    "Z",
  ].join(" ");
  const fuzz = Array.from({ length: CUFF_TUFTS * 3 }, (_, index) => ({
    cx:
      cuff.left +
      tuft *
        ((index % CUFF_TUFTS) + 0.3 + 0.2 * Math.floor(index / CUFF_TUFTS)),
    cy:
      cuff.top +
      (cuff.bottom - cuff.top) * (0.3 + 0.2 * Math.floor(index / CUFF_TUFTS)),
  }));
  const knit = { w: 0.21 * s, h: 0.05 * l };
  const depth = 0.42 * s;
  const layers = Array.from({ length: DEPTH_LAYERS }, (_, step) => ({
    offset: (depth * step) / DEPTH_LAYERS,
    light: Math.round((100 * step) / (DEPTH_LAYERS - 1)),
  }));
  return (
    <g
      data-lm-decoration={props.object.id}
      data-reaction={pose > 0 ? "active" : "idle"}
      transform={face.transform}
      strokeLinejoin="round"
    >
      <defs>
        <clipPath id={`${id}-leg`}>
          <path d={leg} />
        </clipPath>
        <pattern
          id={`${id}-knit`}
          patternUnits="userSpaceOnUse"
          width={knit.w}
          height={knit.h}
        >
          <path
            d={`M0,0 L${knit.w / 2},${knit.h} L${knit.w},0`}
            fill="none"
            stroke="#10141c"
            strokeOpacity={0.28}
            strokeWidth={0.3}
          />
          <path
            d={`M0,${-knit.h * 0.35} L${knit.w / 2},${knit.h * 0.65} L${knit.w},${-knit.h * 0.35}`}
            fill="none"
            stroke="#fff3d6"
            strokeOpacity={0.22}
            strokeWidth={0.25}
          />
        </pattern>
        <linearGradient
          id={`${id}-round`}
          gradientUnits="userSpaceOnUse"
          x1={-0.42 * s}
          x2={0.42 * s}
        >
          <stop stopColor="#10141c" stopOpacity={0.12} />
          <stop offset="0.22" stopColor="#fff3d6" stopOpacity={0.26} />
          <stop offset="0.45" stopColor="#fff3d6" stopOpacity={0} />
          <stop offset="0.55" stopColor="#10141c" stopOpacity={0} />
          <stop offset="1" stopColor="#10141c" stopOpacity={0.42} />
        </linearGradient>
        <linearGradient
          id={`${id}-sole`}
          gradientUnits="userSpaceOnUse"
          x1={0}
          x2={0}
          y1={0.82 * l}
          y2={l}
        >
          <stop stopColor="#10141c" stopOpacity={0} />
          <stop offset="1" stopColor="#10141c" stopOpacity={0.35} />
        </linearGradient>
        <linearGradient
          id={`${id}-tuck`}
          gradientUnits="userSpaceOnUse"
          x1={0}
          x2={0}
          y1={cuff.bottom - 0.02 * l}
          y2={cuff.bottom + 0.06 * l}
        >
          <stop stopColor="#10141c" stopOpacity={0.4} />
          <stop offset="1" stopColor="#10141c" stopOpacity={0} />
        </linearGradient>
        <linearGradient id={`${id}-cuff`} x1="0" x2="0" y1="0" y2="1">
          <stop stopColor={`color-mix(in srgb, ${snow} 85%, #fff)`} />
          <stop offset="0.45" stopColor={snow} />
          <stop
            offset="1"
            stopColor={`color-mix(in srgb, ${snow} 72%, #10141c)`}
          />
        </linearGradient>
        <radialGradient id={`${id}-bell`} cx="0.35" cy="0.3" r="0.75">
          <stop stopColor={`color-mix(in srgb, ${gold} 50%, #fff8e0)`} />
          <stop offset="0.5" stopColor={gold} />
          <stop
            offset="1"
            stopColor={`color-mix(in srgb, ${gold} 60%, #3a2410)`}
          />
        </radialGradient>
      </defs>
      {felts.map((felt, index) => {
        const shades = getColorShades(felt);
        const stripe = index === 1 ? bauble : snow;
        const hook = { x: spacing * (index + 0.5), y: 0 };
        const swing = reducedMotion
          ? pose * props.reactionSettings.strength * (index - 1) * 6
          : Math.sin(progress * Math.PI * 4 + index * 1.3) *
            (1 - progress) ** 1.4 *
            props.reactionSettings.strength *
            14;
        return (
          <g key={index}>
            <path
              d={`M${hook.x},${hook.y} C${hook.x - 0.12 * s},${hook.y + 0.03 * l} ${hook.x - 0.12 * s},${hook.y + 0.07 * l} ${hook.x},${hook.y + 0.08 * l}`}
              fill="none"
              stroke={snow}
              strokeWidth={0.8}
            />
            {layers.map((layer) => (
              <g
                key={layer.offset}
                transform={`translate(${hook.x + layer.offset} ${hook.y + layer.offset}) rotate(${swing})`}
              >
                <path
                  d={leg}
                  fill={`color-mix(in srgb, ${shades[1]} ${layer.light}%, ${shades[3]})`}
                  stroke={layer.offset === 0 ? shades[3] : undefined}
                  strokeWidth={0.6}
                />
                <path
                  d={cuffPath}
                  fill={`color-mix(in srgb, ${snow} ${55 + layer.light * 0.3}%, #10141c)`}
                  stroke={
                    layer.offset === 0
                      ? `color-mix(in srgb, ${snow} 55%, #10141c)`
                      : undefined
                  }
                  strokeWidth={0.4}
                />
              </g>
            ))}
            <g transform={`translate(${hook.x} ${hook.y}) rotate(${swing})`}>
              <g
                transform={`matrix(1 0 1 1 ${cuff.left} ${cuff.top + 0.03 * l})`}
              >
                <ellipse
                  cx={(cuff.right - cuff.left) / 2}
                  cy={depth / 2}
                  rx={(cuff.right - cuff.left) * 0.4}
                  ry={depth * 0.38}
                  fill={`color-mix(in srgb, ${shades[3]} 45%, #10141c)`}
                />
              </g>
            </g>
            <g transform={`translate(${hook.x + depth} ${hook.y + depth})`}>
              <g transform={swing === 0 ? undefined : `rotate(${swing})`}>
                <path d={leg} fill={shades[1]} />
                <path d={toe} fill={stripe} opacity={0.9} />
                <rect
                  x={-0.42 * s}
                  y={0.4 * l}
                  width={0.84 * s}
                  height={0.06 * l}
                  fill={stripe}
                />
                <rect
                  x={-0.42 * s}
                  y={0.52 * l}
                  width={0.84 * s}
                  height={0.06 * l}
                  fill={stripe}
                />
                <g clipPath={`url(#${id}-leg)`}>
                  <rect
                    x={-1.3 * s}
                    y={0}
                    width={1.9 * s}
                    height={l}
                    fill={`url(#${id}-knit)`}
                  />
                  <path d={leg} fill={`url(#${id}-round)`} />
                  <path d={leg} fill={`url(#${id}-sole)`} />
                  <rect
                    x={cuff.left}
                    y={cuff.bottom - 0.02 * l}
                    width={cuff.right - cuff.left}
                    height={0.08 * l}
                    fill={`url(#${id}-tuck)`}
                  />
                </g>
                <path
                  d={cuffPath}
                  fill={`url(#${id}-cuff)`}
                  stroke={`color-mix(in srgb, ${snow} 70%, #10141c)`}
                  strokeWidth={0.4}
                />
                {fuzz.map((dot, dotIndex) => (
                  <circle
                    key={dotIndex}
                    cx={dot.cx}
                    cy={dot.cy}
                    r={0.05 * s}
                    fill={`color-mix(in srgb, ${snow} 70%, #10141c)`}
                    opacity={0.35}
                  />
                ))}
                <circle
                  cx={0.3 * s}
                  cy={0.27 * l}
                  r={0.13 * s}
                  fill={`url(#${id}-bell)`}
                  stroke={`color-mix(in srgb, ${gold} 60%, #3a2410)`}
                  strokeWidth={0.4}
                />
              </g>
            </g>
            <circle cx={hook.x} cy={hook.y} r={1} fill={gold} />
          </g>
        );
      })}
    </g>
  );
}
