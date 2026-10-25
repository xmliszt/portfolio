import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import type {
  SceneConfig,
  SceneDecoration,
} from "@/lib/laundromat/scene-config";

import { CobwebDrawing } from "./cobweb-drawing";
import { GhostDrawing } from "./ghost-drawing";
import { PumpkinDrawing } from "./pumpkin-drawing";
import { SkeletonDrawing } from "./skeleton-drawing";

type SceneDecorationDrawingProps = {
  reaction?: number;
  object: SceneDecoration;
  projection: IsoProjection;
  details: SceneConfig["details"];
};

export function SceneDecorationDrawing(props: SceneDecorationDrawingProps) {
  const { object, projection, details } = props;
  switch (object.kind) {
    case "ghost":
      return (
        <GhostDrawing
          object={object}
          projection={projection}
          details={details.ghost}
          reaction={props.reaction}
          reactionSettings={details.decorationReaction}
        />
      );
    case "skeleton":
      return (
        <SkeletonDrawing
          object={object}
          projection={projection}
          details={details.skeleton}
          reaction={props.reaction}
          reactionSettings={details.decorationReaction}
        />
      );
    case "pumpkin":
      return (
        <PumpkinDrawing
          object={object}
          projection={projection}
          details={details.pumpkin}
          reaction={props.reaction}
          reactionSettings={details.decorationReaction}
        />
      );
    case "cobweb":
      return (
        <CobwebDrawing
          object={object}
          projection={projection}
          details={details.cobweb}
        />
      );
    default: {
      const unhandled: never = object;
      return unhandled;
    }
  }
}
