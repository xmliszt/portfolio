import { useMemo } from "react";

import { getSkeletonShape } from "@/lib/laundromat/decorations/get-skeleton-shape";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import type {
  SceneConfig,
  SceneDecoration,
} from "@/lib/laundromat/scene-config";

import { useDecorationPose } from "./use-decoration-pose";

type SkeletonDrawingProps = {
  reaction?: number;
  reactionSettings: SceneConfig["details"]["decorationReaction"];
  object: Extract<SceneDecoration, { kind: "skeleton" }>;
  projection: IsoProjection;
  details: SceneConfig["details"]["skeleton"];
};

export function SkeletonDrawing(props: SkeletonDrawingProps) {
  const { pose } = useDecorationPose({
    reaction: props.reaction,
    durationMs: props.reactionSettings.durationMs,
  });
  const amount = pose * props.reactionSettings.strength;
  const shape = useMemo(
    () =>
      getSkeletonShape({
        object: props.object,
        projection: props.projection,
        shy: amount,
      }),
    [props.object, props.projection, amount]
  );
  const { bone, shade, joint } = props.details;
  const colors = {
    bone: [
      bone,
      `color-mix(in srgb, ${bone} 80%, ${shade})`,
      `color-mix(in srgb, ${bone} 55%, ${shade})`,
      shade,
    ],
    joint: [joint, joint, shade, shade],
    recess: ["#342c3c", "#2c2433", "#241d2b", "#1b1622"],
  };
  return (
    <g
      data-lm-decoration={props.object.id}
      data-reaction={pose > 0 ? "active" : "idle"}
      stroke="none"
    >
      {shape.faces.map((face, index) => (
        <polygon
          key={index}
          points={face.points}
          fill={colors[face.material][face.shade]}
          stroke={colors[face.material][face.shade]}
          strokeWidth="0.2"
        />
      ))}
    </g>
  );
}
