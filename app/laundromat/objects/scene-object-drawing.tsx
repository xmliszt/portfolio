import type { LaidOutObject } from "@/lib/laundromat/build-scene-layout";
import type { TimeOfDay } from "@/lib/laundromat/get-time-of-day";
import { getShelfBookPlacements } from "@/lib/laundromat/notebook/get-shelf-book-placements";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import type { SceneConfig } from "@/lib/laundromat/scene-config";

import { BasketDrawing } from "./basket-drawing";
import { ClockDrawing } from "./clock-drawing";
import { CoffeeMachineDrawing } from "./coffee-machine-drawing";
import { CounterDrawing } from "./counter-drawing";
import { MachineDrawing } from "./machine-drawing";
import { MugDrawing } from "./mug-drawing";
import { NotebookDrawing } from "./notebook-drawing";
import { PlantDrawing } from "./plant-drawing";
import type { SceneViews } from "./scene-views";
import { ShelfDrawing } from "./shelf-drawing";
import { StoolDrawing } from "./stool-drawing";
import { TableDrawing } from "./table-drawing";
import { TvDrawing } from "./tv-drawing";
import { WindowDrawing } from "./window-drawing";

type SceneObjectDrawingProps = {
  laidOut: LaidOutObject;
  projection: IsoProjection;
  highlightedId: string | undefined;
  views: SceneViews;
  hour: number | undefined;
  timeOfDay: TimeOfDay | undefined;
  config: SceneConfig;
};

export function SceneObjectDrawing(props: SceneObjectDrawingProps) {
  const { laidOut, projection, views, config } = props;
  const { object } = laidOut;
  const { details } = config;
  const highlighted = props.highlightedId === object.id;
  const shared = { laidOut, projection, highlighted };
  switch (object.kind) {
    case "washer":
    case "dryer": {
      const view = views.machines[object.id];
      if (view === undefined) return null;
      return (
        <MachineDrawing
          laidOut={laidOut}
          highlightedId={props.highlightedId}
          view={view}
          machineCycles={
            object.kind === "washer"
              ? config.machines.washerCycleMinutes
              : config.machines.dryerCycleMinutes
          }
          details={details.machine}
        />
      );
    }
    case "tv":
      return (
        <TvDrawing
          laidOut={laidOut}
          projection={projection}
          highlightedId={props.highlightedId}
          view={views.tv}
          details={details.tv}
        />
      );
    case "coffee-machine":
      return (
        <CoffeeMachineDrawing
          laidOut={laidOut}
          projection={projection}
          highlightedId={props.highlightedId}
          phase={views.coffee}
          details={details.coffee}
        />
      );
    case "mug":
      return (
        <MugDrawing
          {...shared}
          steaming={views.coffee.kind === "hot"}
          details={details.coffee}
        />
      );
    case "window":
      return (
        <WindowDrawing
          {...shared}
          timeOfDay={props.timeOfDay}
          config={config}
        />
      );
    case "clock":
      return props.hour === undefined ? null : (
        <ClockDrawing
          laidOut={laidOut}
          projection={projection}
          hour={props.hour}
          details={details.clock}
        />
      );
    case "plant":
      return <PlantDrawing {...shared} details={details.plant} />;
    case "table":
      return <TableDrawing {...shared} />;
    case "stool":
      return <StoolDrawing {...shared} />;
    case "notebook":
      return (
        <NotebookDrawing {...shared} coverNumber={views.notebookNumber} />
      );
    case "shelf":
      return (
        <ShelfDrawing
          {...shared}
          highlightedId={props.highlightedId}
          books={getShelfBookPlacements({
            shelf: object,
            bookNumbers: views.shelfBookNumbers,
            lean: details.shelf.bookLean,
          })}
          details={details.shelf}
        />
      );
    case "basket":
      return <BasketDrawing {...shared} contents={views.basket} />;
    case "counter":
      return <CounterDrawing {...shared} />;
    default: {
      const unhandled: never = object;
      return unhandled;
    }
  }
}
