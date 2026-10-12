import { useMemo, useState } from "react";

import { HitTargetButton } from "@/app/laundromat/hit-target-button";
import { useLaundromatCopy } from "@/app/laundromat/i18n/use-laundromat-copy";
import type { SceneViews } from "@/app/laundromat/objects/scene-views";
import { RoomDrawing } from "@/app/laundromat/room-drawing";
import { SceneControlButton } from "@/app/laundromat/scene-control-button";
import { SceneTooltip } from "@/app/laundromat/scene-tooltip";
import { useRoomAppliances } from "@/app/laundromat/use-room-appliances";
import type { LaidOutControl } from "@/lib/laundromat/build-scene-layout";
import { buildSceneLayout } from "@/lib/laundromat/build-scene-layout";
import { describeCoffeeCup } from "@/lib/laundromat/coffee/describe-coffee-cup";
import { describeCoffeeFlask } from "@/lib/laundromat/coffee/describe-coffee-flask";
import { describeCoffeeMachine } from "@/lib/laundromat/coffee/describe-coffee-machine";
import { describeCoffeeSwitch } from "@/lib/laundromat/coffee/describe-coffee-switch";
import { describeSceneObject } from "@/lib/laundromat/describe-scene-object";
import { describeEntranceMat } from "@/lib/laundromat/laundry/describe-entrance-mat";
import { describeLaundryBasket } from "@/lib/laundromat/laundry/describe-laundry-basket";
import { describeMachine } from "@/lib/laundromat/laundry/describe-machine";
import { describeMachineControl } from "@/lib/laundromat/laundry/describe-machine-control";
import { formatRemainingTime } from "@/lib/laundromat/laundry/format-remaining-time";
import type { BasketContents } from "@/lib/laundromat/laundry/get-basket-contents";
import { getCycleMinutes } from "@/lib/laundromat/laundry/get-cycle-minutes";
import { getDialAngleDeg } from "@/lib/laundromat/laundry/get-dial-angle-deg";
import type { MachineStatus } from "@/lib/laundromat/laundry/get-machine-status";
import type { SceneConfig, SceneObject } from "@/lib/laundromat/scene-config";
import { describeTv } from "@/lib/laundromat/tv/describe-tv";
import { describeTvControl } from "@/lib/laundromat/tv/describe-tv-control";

const WORKBENCH_UNIT_PX = 40;
const MS_PER_MINUTE = 60_000;
const KNOB_CONTROLS: LaidOutControl["control"][] = ["dial", "tuner", "volume"];
const WORKBENCH_SHELF_BOOKS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export type WorkbenchMachineState = "loadable" | "loaded" | "running" | "done";

type ObjectWorkbenchProps = {
  config: SceneConfig;
  object: SceneObject;
  scale: number;
  highlighted: boolean;
  tooltipPinned: boolean;
  hour: number;
  machineState: WorkbenchMachineState;
  doorOpen: boolean;
  basket: BasketContents;
};

export function ObjectWorkbench(props: ObjectWorkbenchProps) {
  const { copy } = useLaundromatCopy();
  const { config, object } = props;
  const [hoveredId, setHoveredId] = useState<string>();
  const [cycleMinutes, setCycleMinutes] = useState<{
    [machineId: string]: number;
  }>({});
  const [openedAt] = useState(() => Date.now());
  const appliances = useRoomAppliances({ config, visitorId: undefined });
  const [plantTouchCount, setPlantTouchCount] = useState(0);
  const [tubeRollCount, setTubeRollCount] = useState(0);
  const layout = useMemo(() => {
    const { size } = object;
    return buildSceneLayout({
      config: {
        ...config,
        room: {
          width: Math.ceil(size.w) + 2,
          depth: Math.ceil(size.d) + 2,
          wallHeight: Math.ceil(size.h) + 1,
        },
        objects: [{ ...object, position: { x: 1, y: 1, z: 0 } }],
      },
      unit: WORKBENCH_UNIT_PX,
    });
  }, [config, object]);

  const machine = (() => {
    if (object.kind !== "washer" && object.kind !== "dryer") return undefined;
    const ref = { id: object.id, kind: object.kind, number: object.number };
    const cycle = getCycleMinutes({
      state: { load: { kind: "folded" }, cycleMinutes },
      machine: ref,
      machines: config.machines,
    });
    const remainingMs = cycle.minutes * MS_PER_MINUTE;
    const status: MachineStatus =
      props.machineState === "running"
        ? {
            kind: "running",
            endsAt: openedAt + remainingMs,
            remainingMs,
            remind: false,
          }
        : { kind: props.machineState };
    const readout = (() => {
      switch (status.kind) {
        case "running":
          return formatRemainingTime(status.remainingMs);
        case "done":
          return "done";
        default:
          return `${String(cycle.minutes).padStart(2, "0")}:00`;
      }
    })();
    return { ref, cycle, status, readout };
  })();

  const views: SceneViews = {
    machines:
      machine === undefined
        ? {}
        : {
            [object.id]: {
              status: machine.status,
              readout: machine.readout,
              dialAngleDeg: getDialAngleDeg({
                detent: machine.cycle.detent,
                detentCount: config.machines.cycleMinutes.length,
              }),
              doorOpen: props.doorOpen,
            },
          },
    tv: { state: appliances.tv, noSignal: false },
    coffee: appliances.coffee,
    cup: {
      full: appliances.cup.kind === "full",
      steaming: appliances.isCupSteaming,
    },
    plantTouchCount,
    basket: props.basket,
    matReady: describeEntranceMat({ basket: props.basket, copy }).ready,
    shelfBookNumbers: WORKBENCH_SHELF_BOOKS,
    notebookNumber: config.details.notebook.coverNumber,
    peopleHere: 3,
    tubeRollCount,
  };

  function describeObject() {
    if (machine !== undefined) {
      return describeMachine({
        machine: machine.ref,
        status: machine.status,
        copy,
      });
    }
    switch (object.kind) {
      case "tv":
        return describeTv({
          state: appliances.tv,
          settings: config.details.tv,
          copy,
        });
      case "coffee-machine":
        return describeCoffeeMachine({ phase: appliances.coffee, copy });
      case "mug":
        return describeCoffeeCup({ cup: appliances.cup, copy });
      case "basket":
        return describeLaundryBasket({ basket: props.basket, copy });
      default:
        return describeSceneObject({
          object,
          copy,
          peopleHere: views.peopleHere,
        });
    }
  }

  function describeControl(control: LaidOutControl) {
    switch (control.target) {
      case "machine":
        return machine === undefined
          ? undefined
          : describeMachineControl({
              control: control.control,
              machine: machine.ref,
              status: machine.status,
              minutes: machine.cycle.minutes,
              nextMinutes: machine.cycle.next,
              notifications: "unsupported",
              copy,
            });
      case "tv":
        return describeTvControl({
          control: control.control,
          state: appliances.tv,
          settings: config.details.tv,
          copy,
        });
      case "coffee":
        return control.control === "flask"
          ? describeCoffeeFlask({
              phase: appliances.coffee,
              cup: appliances.cup,
              copy,
            })
          : describeCoffeeSwitch({ phase: appliances.coffee, copy });
      default: {
        const unhandled: never = control;
        return unhandled;
      }
    }
  }

  function pressControl(options: { control: LaidOutControl; step: 1 | -1 }) {
    const { control, step } = options;
    switch (control.target) {
      case "machine":
        if (machine !== undefined && control.control === "dial") {
          const minutes =
            step === 1 ? machine.cycle.next : machine.cycle.previous;
          setCycleMinutes((current) => ({ ...current, [object.id]: minutes }));
        }
        return;
      case "tv":
        switch (control.control) {
          case "tuner":
            appliances.dispatchTv({ type: "tune", step });
            return;
          case "volume":
            appliances.dispatchTv({ type: "volume", step });
            return;
          default:
            appliances.dispatchTv({ type: "power" });
            return;
        }
      case "coffee":
        appliances.dispatchCoffee({
          type: control.control === "flask" ? "pour" : "brew",
        });
        return;
      default: {
        const unhandled: never = control;
        return unhandled;
      }
    }
  }

  function handleObjectActivate() {
    setHoveredId(object.id);
    if (object.kind === "plant") setPlantTouchCount((count) => count + 1);
    if (object.kind === "mug") appliances.dispatchCoffee({ type: "drink" });
    if (object.kind === "tube-display") setTubeRollCount((count) => count + 1);
  }

  const laidOut = layout.objects.at(0);
  const description = describeObject();
  const shownId = hoveredId ?? (props.tooltipPinned ? object.id : undefined);
  const tooltip = (() => {
    if (laidOut === undefined || shownId === undefined) return undefined;
    if (shownId === object.id) {
      return { text: description?.tooltip, bounds: laidOut.bounds };
    }
    const control = laidOut.controls.find(({ id }) => id === shownId);
    if (control === undefined) return undefined;
    return { text: describeControl(control)?.tooltip, bounds: control.bounds };
  })();

  return (
    <div className="flex size-full items-center justify-center overflow-hidden">
      <div
        className="relative shrink-0"
        style={{
          width: layout.size.width * props.scale,
          height: layout.size.height * props.scale,
        }}
      >
        <div
          className="absolute top-0 left-0 origin-top-left"
          style={{
            width: layout.size.width,
            height: layout.size.height,
            transform: `scale(${props.scale})`,
          }}
        >
          <RoomDrawing
            layout={layout}
            highlightedId={
              hoveredId ?? (props.highlighted ? object.id : undefined)
            }
            focusedObjectId={undefined}
            hiddenObjectId={undefined}
            dimAmount={0}
            views={views}
            hour={props.hour}
            lampSwitch={undefined}
            config={config}
          />
          {laidOut !== undefined && description !== undefined && (
            <HitTargetButton
              laidOut={laidOut}
              label={description.label}
              pressed={undefined}
              onActivate={handleObjectActivate}
              onPointerShowTooltip={() => setHoveredId(object.id)}
              onKeyboardShowTooltip={() => setHoveredId(object.id)}
              onHideTooltip={() => setHoveredId(undefined)}
            />
          )}
          {laidOut?.controls.map((control) => {
            const controlDescription = describeControl(control);
            if (controlDescription === undefined) return null;
            return (
              <SceneControlButton
                key={control.id}
                control={control}
                knob={KNOB_CONTROLS.includes(control.control)}
                label={controlDescription.label}
                enabled={controlDescription.enabled}
                onPress={() => pressControl({ control, step: 1 })}
                onStepBack={() => pressControl({ control, step: -1 })}
                onPointerShowTooltip={() => setHoveredId(control.id)}
                onKeyboardShowTooltip={() => setHoveredId(control.id)}
                onHideTooltip={() => setHoveredId(undefined)}
              />
            );
          })}
        </div>
        <SceneTooltip
          text={tooltip?.text}
          position={
            tooltip === undefined
              ? undefined
              : {
                  x:
                    (tooltip.bounds.x + tooltip.bounds.width / 2) * props.scale,
                  y: tooltip.bounds.y * props.scale,
                }
          }
        />
      </div>
    </div>
  );
}
