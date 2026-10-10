import { useMemo, useState } from "react";

import { HitTargetButton } from "@/app/laundromat/hit-target-button";
import { RoomDrawing } from "@/app/laundromat/room-drawing";
import { SceneTooltip } from "@/app/laundromat/scene-tooltip";
import { buildSceneLayout } from "@/lib/laundromat/build-scene-layout";
import { describeSceneObject } from "@/lib/laundromat/describe-scene-object";
import { getCycleMinutes } from "@/lib/laundromat/laundry/get-cycle-minutes";
import type { MachineStatus } from "@/lib/laundromat/laundry/get-machine-status";
import { INITIAL_LAUNDRY_STATE } from "@/lib/laundromat/laundry/laundry-state";
import type { SceneConfig, SceneObject } from "@/lib/laundromat/scene-config";

const WORKBENCH_UNIT_PX = 40;
const DIAL_DEGREES_PER_DETENT = 60;

type ObjectWorkbenchProps = {
  config: SceneConfig;
  object: SceneObject;
  scale: number;
  highlighted: boolean;
  tooltipPinned: boolean;
  hour: number;
};

export function ObjectWorkbench(props: ObjectWorkbenchProps) {
  const [isHovered, setIsHovered] = useState(false);
  const layout = useMemo(() => {
    const { size } = props.object;
    return buildSceneLayout({
      config: {
        ...props.config,
        room: {
          width: Math.ceil(size.w) + 2,
          depth: Math.ceil(size.d) + 2,
          wallHeight: Math.ceil(size.h) + 1,
        },
        objects: [{ ...props.object, position: { x: 1, y: 1, z: 0 } }],
      },
      unit: WORKBENCH_UNIT_PX,
    });
  }, [props.config, props.object]);
  const machineViews = (() => {
    const { object } = props;
    if (object.kind !== "washer" && object.kind !== "dryer") return {};
    const cycle = getCycleMinutes({
      state: INITIAL_LAUNDRY_STATE,
      machine: { id: object.id, kind: object.kind, number: object.number },
      machines: props.config.machines,
    });
    const status: MachineStatus = { kind: "loadable" };
    return {
      [object.id]: {
        status,
        readout: `${String(cycle.minutes).padStart(2, "0")}:00`,
        dialAngleDeg: -90 + cycle.detent * DIAL_DEGREES_PER_DETENT,
      },
    };
  })();
  const laidOut = layout.objects.at(0);
  const description =
    laidOut === undefined ? undefined : describeSceneObject(laidOut.object);
  const isTooltipShown =
    description !== undefined && (props.tooltipPinned || isHovered);

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
              props.highlighted || isHovered ? props.object.id : undefined
            }
            focusedObjectId={undefined}
            dimAmount={0}
            machineViews={machineViews}
            hour={props.hour}
            config={props.config}
          />
          {laidOut !== undefined && description !== undefined && (
            <HitTargetButton
              laidOut={laidOut}
              label={description.label}
              pressed={undefined}
              onActivate={() => setIsHovered(true)}
              onPointerShowTooltip={() => setIsHovered(true)}
              onKeyboardShowTooltip={() => setIsHovered(true)}
              onHideTooltip={() => setIsHovered(false)}
            />
          )}
        </div>
        <SceneTooltip
          text={isTooltipShown ? description.tooltip : undefined}
          position={
            laidOut === undefined
              ? undefined
              : {
                  x:
                    (laidOut.bounds.x + laidOut.bounds.width / 2) * props.scale,
                  y: laidOut.bounds.y * props.scale,
                }
          }
        />
      </div>
    </div>
  );
}
