import { useMemo } from "react";

import { getColorShades } from "@/lib/laundromat/decorations/get-color-shades";
import { getPoinsettiaShape } from "@/lib/laundromat/decorations/get-poinsettia-shape";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import type {
  SceneConfig,
  SceneDecoration,
} from "@/lib/laundromat/scene-config";
import { toSvgPoints } from "@/lib/laundromat/to-svg-points";

import { useDecorationPose } from "./use-decoration-pose";

type PoinsettiaDrawingProps = {
  reaction?: number;
  reactionSettings: SceneConfig["details"]["decorationReaction"];
  object: Extract<SceneDecoration, { kind: "poinsettia" }>;
  projection: IsoProjection;
  details: SceneConfig["details"]["christmas"];
};

export function PoinsettiaDrawing(props: PoinsettiaDrawingProps) {
  const { pose, progress, reducedMotion } = useDecorationPose({
    reaction: props.reaction,
    durationMs: props.reactionSettings.durationMs,
  });
  const rustle = reducedMotion
    ? pose * 0.08 * props.reactionSettings.strength
    : Math.sin(progress * Math.PI * 7) *
      (1 - progress) ** 1.5 *
      0.14 *
      props.reactionSettings.strength;
  const shape = useMemo(
    () =>
      getPoinsettiaShape({
        object: props.object,
        projection: props.projection,
        rustle,
      }),
    [props.object, props.projection, rustle]
  );
  const { needle, bauble, gold } = props.details;
  const colors = {
    leaf: getColorShades(needle),
    bract: getColorShades(bauble),
  };
  const foil = getColorShades(gold);
  return (
    <g
      data-lm-decoration={props.object.id}
      data-reaction={pose > 0 ? "active" : "idle"}
      strokeLinejoin="round"
    >
      <path d={shape.pot.body} fill={foil[1]} stroke="none" />
      {shape.pot.facets.map((facet) => (
        <polygon
          key={facet.shade}
          points={toSvgPoints(facet.points)}
          fill={foil[3 - facet.shade]}
          stroke="none"
        />
      ))}
      <path d={shape.pot.body} fill="none" stroke={foil[3]} strokeWidth={0.6} />
      <ellipse
        cx={shape.pot.top.cx}
        cy={shape.pot.top.cy}
        rx={shape.pot.top.rx}
        ry={shape.pot.top.ry}
        fill="#3a2a20"
        stroke={foil[0]}
        strokeWidth={0.8}
      />
      {shape.leaves.map((leaf, index) => {
        const shades = colors[leaf.kind];
        return (
          <g key={index}>
            <path
              d={leaf.d}
              fill={shades[leaf.shade]}
              stroke={shades[3]}
              strokeWidth={0.5}
            />
            <path
              d={leaf.vein}
              fill="none"
              stroke={shades[3]}
              strokeWidth={0.4}
              strokeOpacity={0.7}
            />
          </g>
        );
      })}
      {shape.flowers.map((point, index) => (
        <circle
          key={index}
          cx={point.x}
          cy={point.y}
          r={shape.flowerRadius}
          fill="#e8c341"
          stroke="#7a5b17"
          strokeWidth={0.35}
        />
      ))}
    </g>
  );
}
