import { getColorShades } from "@/lib/laundromat/decorations/get-color-shades";
import { getFacePlane } from "@/lib/laundromat/get-face-plane";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import type {
  SceneConfig,
  SceneDecoration,
} from "@/lib/laundromat/scene-config";

import { useDecorationPose } from "./use-decoration-pose";

const STOCKING_COUNT = 3;

type StockingsDrawingProps = {
  reaction?: number;
  reactionSettings: SceneConfig["details"]["decorationReaction"];
  object: Extract<SceneDecoration, { kind: "stockings" }>;
  projection: IsoProjection;
  details: SceneConfig["details"]["christmas"];
};

export function StockingsDrawing(props: StockingsDrawingProps) {
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
  return (
    <g
      data-lm-decoration={props.object.id}
      data-reaction={pose > 0 ? "active" : "idle"}
      transform={face.transform}
      strokeLinejoin="round"
    >
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
            <g transform={`translate(${hook.x} ${hook.y})`}>
              <g transform={swing === 0 ? undefined : `rotate(${swing})`}>
                <path
                  d={`M0,0 C${-0.12 * s},${0.03 * l} ${-0.12 * s},${0.07 * l} 0,${0.08 * l}`}
                  fill="none"
                  stroke={snow}
                  strokeWidth={0.8}
                />
                <path
                  d={leg}
                  fill={shades[1]}
                  stroke={shades[3]}
                  strokeWidth={0.6}
                />
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
                <rect
                  x={-0.52 * s}
                  y={0.07 * l}
                  width={1.04 * s}
                  height={0.2 * l}
                  rx={0.08 * s}
                  fill={snow}
                  stroke={`color-mix(in srgb, ${snow} 70%, #10141c)`}
                  strokeWidth={0.5}
                />
                <circle
                  cx={0.3 * s}
                  cy={0.27 * l}
                  r={0.13 * s}
                  fill={gold}
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
