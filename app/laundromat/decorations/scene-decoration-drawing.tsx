import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import type {
  SceneConfig,
  SceneDecoration,
} from "@/lib/laundromat/scene-config";

import { ChristmasTreeDrawing } from "./christmas-tree-drawing";
import { CobwebDrawing } from "./cobweb-drawing";
import { GarlandDrawing } from "./garland-drawing";
import { GhostDrawing } from "./ghost-drawing";
import { HollyDrawing } from "./holly-drawing";
import { PoinsettiaDrawing } from "./poinsettia-drawing";
import { PresentDrawing } from "./present-drawing";
import { PumpkinDrawing } from "./pumpkin-drawing";
import { SkeletonDrawing } from "./skeleton-drawing";
import { SnowflakesDrawing } from "./snowflakes-drawing";
import { SnowmanDrawing } from "./snowman-drawing";
import { StockingsDrawing } from "./stockings-drawing";

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
    case "christmas-tree":
      return (
        <ChristmasTreeDrawing
          object={object}
          projection={projection}
          details={details.christmas}
          reaction={props.reaction}
          reactionSettings={details.decorationReaction}
        />
      );
    case "present":
      return (
        <PresentDrawing
          object={object}
          projection={projection}
          details={details.christmas}
          reaction={props.reaction}
          reactionSettings={details.decorationReaction}
        />
      );
    case "stockings":
      return (
        <StockingsDrawing
          object={object}
          projection={projection}
          details={details.christmas}
          reaction={props.reaction}
          reactionSettings={details.decorationReaction}
        />
      );
    case "snowflakes":
      return (
        <SnowflakesDrawing
          object={object}
          projection={projection}
          details={details.christmas}
          reaction={props.reaction}
          reactionSettings={details.decorationReaction}
        />
      );
    case "poinsettia":
      return (
        <PoinsettiaDrawing
          object={object}
          projection={projection}
          details={details.christmas}
          reaction={props.reaction}
          reactionSettings={details.decorationReaction}
        />
      );
    case "snowman":
      return (
        <SnowmanDrawing
          object={object}
          projection={projection}
          details={details.christmas}
          reaction={props.reaction}
          reactionSettings={details.decorationReaction}
        />
      );
    case "garland":
      return (
        <GarlandDrawing
          object={object}
          projection={projection}
          details={details.christmas}
        />
      );
    case "holly":
      return (
        <HollyDrawing
          object={object}
          projection={projection}
          details={details.christmas}
        />
      );
    default: {
      const unhandled: never = object;
      return unhandled;
    }
  }
}
