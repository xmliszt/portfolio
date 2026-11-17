import { getColorShades } from "@/lib/laundromat/decorations/get-color-shades";
import {
  type IsoProjection,
  projectIsoPoint,
} from "@/lib/laundromat/project-iso-point";
import type {
  SceneConfig,
  SceneDecoration,
} from "@/lib/laundromat/scene-config";

const LEAF = [
  [0, 0],
  [0.18, -0.16],
  [0.26, -0.06],
  [0.4, -0.2],
  [0.5, -0.08],
  [0.66, -0.2],
  [0.72, -0.06],
  [0.9, -0.14],
  [1, 0],
  [0.9, 0.14],
  [0.72, 0.08],
  [0.66, 0.2],
  [0.5, 0.1],
  [0.4, 0.2],
  [0.26, 0.08],
  [0.18, 0.16],
] as const;

type HollyDrawingProps = {
  object: Extract<SceneDecoration, { kind: "holly" }>;
  projection: IsoProjection;
  details: SceneConfig["details"]["christmas"];
};

export function HollyDrawing(props: HollyDrawingProps) {
  const { position, size } = props.object;
  const { needle, bauble } = props.details;
  const leaf = getColorShades(needle);
  const berry = getColorShades(bauble);
  const anchor = projectIsoPoint({
    point: {
      x: position.x + size.w / 2,
      y: position.y + size.d / 2,
      z: position.z + size.h * 0.35,
    },
    projection: props.projection,
  });
  const length = size.w * props.projection.unit * 0.5;
  const berryRadius = length * 0.13;
  return (
    <g
      data-lm-decoration={props.object.id}
      transform={`translate(${anchor.x} ${anchor.y})`}
      strokeLinejoin="round"
    >
      {[
        { angle: 200, shade: 1 },
        { angle: -20, shade: 2 },
        { angle: 245, shade: 0 },
      ].map((item, index) => (
        <polygon
          key={index}
          points={LEAF.map(
            ([x, y]) => `${x * length},${y * length * 1.1}`
          ).join(" ")}
          transform={`rotate(${item.angle})`}
          fill={leaf[item.shade]}
          stroke={leaf[3]}
          strokeWidth={0.5}
        />
      ))}
      {[
        { x: -0.18, y: -0.12 },
        { x: 0.16, y: -0.1 },
        { x: 0, y: -0.3 },
      ].map((point, index) => (
        <g key={index}>
          <circle
            cx={point.x * length}
            cy={point.y * length}
            r={berryRadius}
            fill={berry[1]}
            stroke={berry[3]}
            strokeWidth={0.4}
          />
          <circle
            cx={point.x * length - berryRadius * 0.35}
            cy={point.y * length - berryRadius * 0.35}
            r={berryRadius * 0.3}
            fill="#fff"
            opacity={0.6}
          />
        </g>
      ))}
    </g>
  );
}
