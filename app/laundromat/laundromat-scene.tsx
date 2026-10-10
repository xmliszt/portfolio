"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";

import { buildSceneLayout } from "@/lib/laundromat/build-scene-layout";
import type { Camera, Viewport } from "@/lib/laundromat/compute-camera";
import { computeCamera } from "@/lib/laundromat/compute-camera";
import { describeSceneObject } from "@/lib/laundromat/describe-scene-object";
import { getCameraMoveDurationMs } from "@/lib/laundromat/get-camera-move-duration-ms";
import { describeMachine } from "@/lib/laundromat/laundry/describe-machine";
import type { MachineControl } from "@/lib/laundromat/laundry/describe-machine-control";
import { describeMachineControl } from "@/lib/laundromat/laundry/describe-machine-control";
import { formatRemainingTime } from "@/lib/laundromat/laundry/format-remaining-time";
import { getCycleMinutes } from "@/lib/laundromat/laundry/get-cycle-minutes";
import { getMachineStatus } from "@/lib/laundromat/laundry/get-machine-status";
import type { CameraFocus } from "@/lib/laundromat/parse-camera-focus";
import { parseCameraFocus } from "@/lib/laundromat/parse-camera-focus";
import type { FocusTarget } from "@/lib/laundromat/scene-config";
import { sceneConfig } from "@/lib/laundromat/scene-config";
import { cn } from "@/lib/utils";

import { HitTargetButton } from "./hit-target-button";
import { MachineControlButton } from "./machine-control-button";
import { RoomDrawing } from "./room-drawing";
import { SceneTooltip } from "./scene-tooltip";
import { useLaundry } from "./use-laundry";
import { useSceneHour } from "./use-scene-hour";

const SCENE_UNIT_PX = 40;
const TOOLTIP_DELAY_MS = 300;
const FOCUS_TARGETS = ["shelf", "notebook"] satisfies FocusTarget[];
const DIAL_DEGREES_PER_DETENT = 60;

const layout = buildSceneLayout({ config: sceneConfig, unit: SCENE_UNIT_PX });

function getFocusedObjectId(focus: CameraFocus) {
  return focus === "room"
    ? undefined
    : sceneConfig.camera.focusTargets[focus].objectId;
}

function findFocusTarget(objectId: string) {
  return FOCUS_TARGETS.find(
    (target) => sceneConfig.camera.focusTargets[target].objectId === objectId
  );
}

export function LaundromatScene() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const focus = parseCameraFocus(searchParams.get("focus"));
  const focusedObjectId = getFocusedObjectId(focus);
  const prefersReducedMotion = useReducedMotion() ?? false;
  const hour = useSceneHour();

  const rootRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState<Viewport>();
  const [isReady, setIsReady] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string>();
  const [tooltipId, setTooltipId] = useState<string>();
  const tooltipTimerRef = useRef<number>(undefined);
  const tooltipCooldownTimerRef = useRef<number>(undefined);
  const isTooltipWarmRef = useRef(false);

  const cameraX = useMotionValue(0);
  const cameraY = useMotionValue(0);
  const cameraScale = useMotionValue(1);
  const sceneOpacity = useMotionValue(1);
  const previousCameraRef = useRef<{ camera: Camera; focus: CameraFocus }>(
    undefined
  );
  const previousFocusRef = useRef(focus);
  const laundry = useLaundry();

  const machineViews = Object.fromEntries(
    layout.objects.flatMap(({ object }) => {
      if (object.kind !== "washer" && object.kind !== "dryer") return [];
      const machine = {
        id: object.id,
        kind: object.kind,
        number: object.number,
      };
      const status = getMachineStatus({
        state: laundry.state,
        machine,
        now: laundry.now,
      });
      const cycle = getCycleMinutes({
        state: laundry.state,
        machine,
        machines: sceneConfig.machines,
      });
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
      return [
        [
          object.id,
          {
            machine,
            status,
            cycle,
            readout,
            dialAngleDeg: -90 + cycle.detent * DIAL_DEGREES_PER_DETENT,
          },
        ],
      ];
    })
  );
  type MachineView = (typeof machineViews)[string];

  function describeControl(options: {
    view: MachineView;
    control: MachineControl;
  }) {
    const { view } = options;
    return describeMachineControl({
      control: options.control,
      machine: view.machine,
      status: view.status,
      minutes: view.cycle.minutes,
      nextMinutes: view.cycle.next,
      notifications: laundry.notifications,
    });
  }

  function describeObject(objectId: string) {
    const view = machineViews[objectId];
    if (view !== undefined) return describeMachine(view);
    const laidOut = layout.objects.find(({ object }) => object.id === objectId);
    return laidOut === undefined
      ? undefined
      : describeSceneObject(laidOut.object);
  }

  useEffect(() => {
    const root = rootRef.current;
    if (root === null) return;
    const observer = new ResizeObserver(([entry]) => {
      setViewport({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (viewport === undefined) return;
    const camera = computeCamera({
      focus,
      viewport,
      layout,
      config: sceneConfig,
    });
    const previous = previousCameraRef.current;
    previousCameraRef.current = { camera, focus };

    function jumpTo(target: Camera) {
      cameraX.set(target.x);
      cameraY.set(target.y);
      cameraScale.set(target.scale);
    }

    const from =
      previous?.camera ??
      computeCamera({ focus: "room", viewport, layout, config: sceneConfig });
    if (previous === undefined) {
      jumpTo(from);
      setIsReady(true);
    }
    const isResize = previous?.focus === focus;
    if (isResize || (previous === undefined && focus === "room")) {
      jumpTo(camera);
      return;
    }
    if (prefersReducedMotion) {
      jumpTo(camera);
      const fade = animate(sceneOpacity, [0.5, 1], { duration: 0.25 });
      return () => fade.stop();
    }
    const transition = {
      duration:
        getCameraMoveDurationMs({
          from,
          to: camera,
          viewport,
          config: sceneConfig,
        }) / 1000,
      ease: sceneConfig.camera.ease,
    };
    const moves = [
      animate(cameraX, camera.x, transition),
      animate(cameraY, camera.y, transition),
      animate(cameraScale, camera.scale, transition),
    ];
    return () => moves.forEach((move) => move.stop());
  }, [
    viewport,
    focus,
    prefersReducedMotion,
    cameraX,
    cameraY,
    cameraScale,
    sceneOpacity,
  ]);

  useEffect(() => {
    const previousFocus = previousFocusRef.current;
    previousFocusRef.current = focus;
    if (previousFocus === focus) return;
    window.clearTimeout(tooltipTimerRef.current);
    setTooltipId(undefined);
    setHighlightedId(undefined);
    const objectId = focusedObjectId ?? getFocusedObjectId(previousFocus);
    if (objectId !== undefined) {
      rootRef.current
        ?.querySelector<HTMLButtonElement>(`[data-hit-target="${objectId}"]`)
        ?.focus({ preventScroll: true });
    }
  }, [focus, focusedObjectId]);

  useEffect(
    () => () => {
      window.clearTimeout(tooltipTimerRef.current);
      window.clearTimeout(tooltipCooldownTimerRef.current);
    },
    []
  );

  function setFocus(next: CameraFocus) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "room") params.delete("focus");
    else params.set("focus", next);
    const query = params.toString();
    router.push(query === "" ? window.location.pathname : `?${query}`, {
      scroll: false,
    });
  }

  useEffect(() => {
    if (focus === "room") return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setFocus("room");
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  function showTooltip(options: {
    objectId: string;
    source: "pointer" | "keyboard";
  }) {
    window.clearTimeout(tooltipTimerRef.current);
    setHighlightedId(options.objectId);
    const isMovingBetweenTargets =
      tooltipId !== undefined || isTooltipWarmRef.current;
    if (options.source === "keyboard" || isMovingBetweenTargets) {
      setTooltipId(options.objectId);
      return;
    }
    tooltipTimerRef.current = window.setTimeout(
      () => setTooltipId(options.objectId),
      TOOLTIP_DELAY_MS
    );
  }

  function hideTooltip(objectId: string) {
    window.clearTimeout(tooltipTimerRef.current);
    if (tooltipId !== undefined) {
      isTooltipWarmRef.current = true;
      window.clearTimeout(tooltipCooldownTimerRef.current);
      tooltipCooldownTimerRef.current = window.setTimeout(() => {
        isTooltipWarmRef.current = false;
      }, TOOLTIP_DELAY_MS);
    }
    setTooltipId(undefined);
    setHighlightedId((current) => (current === objectId ? undefined : current));
  }

  function handleActivate(objectId: string) {
    const target = findFocusTarget(objectId);
    if (target !== undefined) {
      if (target !== focus) setFocus(target);
      return;
    }
    if (focus !== "room") setFocus("room");
  }

  function handleControlPress(options: {
    view: MachineView;
    control: MachineControl;
    step: 1 | -1;
  }) {
    const { view, control, step } = options;
    if (focus !== "room") {
      setFocus("room");
      return;
    }
    switch (control) {
      case "dial":
        laundry.dispatch({ type: "turn-dial", machine: view.machine, step });
        return;
      case "start":
        if (view.status.kind === "running") {
          void laundry.remind(view.machine);
          return;
        }
        laundry.start(view.machine);
        return;
      case "door":
        laundry.dispatch({ type: "open-door", machine: view.machine });
        return;
      default: {
        const unhandled: never = control;
        return unhandled;
      }
    }
  }

  function handleBackdropClick(event: React.MouseEvent<HTMLDivElement>) {
    if (focus === "room") return;
    const isOnHitTarget =
      event.target instanceof Element &&
      event.target.closest("[data-hit-target]") !== null;
    if (!isOnHitTarget) setFocus("room");
  }

  const tooltip = (() => {
    if (tooltipId === undefined || viewport === undefined) return undefined;
    const target = layout.objects
      .flatMap((laidOut) => [
        {
          id: laidOut.object.id,
          bounds: laidOut.bounds,
          text: () => describeObject(laidOut.object.id)?.tooltip,
        },
        ...laidOut.controls.map((control) => ({
          id: control.id,
          bounds: control.bounds,
          text: () => {
            const view = machineViews[laidOut.object.id];
            return view === undefined
              ? undefined
              : describeControl({ view, control: control.control }).tooltip;
          },
        })),
      ])
      .find(({ id }) => id === tooltipId);
    if (target === undefined) return undefined;
    const camera = computeCamera({
      focus,
      viewport,
      layout,
      config: sceneConfig,
    });
    return {
      text: target.text(),
      position: {
        x:
          (target.bounds.x + target.bounds.width / 2) * camera.scale + camera.x,
        y: target.bounds.y * camera.scale + camera.y,
      },
    };
  })();

  return (
    <div
      ref={rootRef}
      className="relative size-full overflow-hidden"
      onClick={handleBackdropClick}
    >
      <motion.div
        className={cn(
          "absolute top-0 left-0 origin-top-left",
          !isReady && "invisible"
        )}
        style={{
          x: cameraX,
          y: cameraY,
          scale: cameraScale,
          opacity: sceneOpacity,
          width: layout.size.width,
          height: layout.size.height,
        }}
      >
        <RoomDrawing
          layout={layout}
          highlightedId={highlightedId}
          focusedObjectId={focusedObjectId}
          dimAmount={sceneConfig.camera.unfocusedDim}
          machineViews={machineViews}
          hour={hour}
          config={sceneConfig}
        />
        {layout.objects.map((laidOut) => {
          const { id } = laidOut.object;
          const description = describeObject(id);
          if (description === undefined) return null;
          const focusTarget = findFocusTarget(id);
          const view = machineViews[id];
          return (
            <Fragment key={id}>
              <HitTargetButton
                laidOut={laidOut}
                label={description.label}
                pressed={
                  focusTarget === undefined ? undefined : focusTarget === focus
                }
                onActivate={() => handleActivate(id)}
                onPointerShowTooltip={() =>
                  showTooltip({ objectId: id, source: "pointer" })
                }
                onKeyboardShowTooltip={() =>
                  showTooltip({ objectId: id, source: "keyboard" })
                }
                onHideTooltip={() => hideTooltip(id)}
              />
              {view !== undefined &&
                laidOut.controls.map((control) => {
                  const controlDescription = describeControl({
                    view,
                    control: control.control,
                  });
                  return (
                    <MachineControlButton
                      key={control.id}
                      control={control}
                      label={controlDescription.label}
                      enabled={controlDescription.enabled}
                      onPress={() =>
                        handleControlPress({
                          view,
                          control: control.control,
                          step: 1,
                        })
                      }
                      onStepBack={() =>
                        handleControlPress({
                          view,
                          control: control.control,
                          step: -1,
                        })
                      }
                      onPointerShowTooltip={() =>
                        showTooltip({ objectId: control.id, source: "pointer" })
                      }
                      onKeyboardShowTooltip={() =>
                        showTooltip({
                          objectId: control.id,
                          source: "keyboard",
                        })
                      }
                      onHideTooltip={() => hideTooltip(control.id)}
                    />
                  );
                })}
            </Fragment>
          );
        })}
      </motion.div>
      <SceneTooltip text={tooltip?.text} position={tooltip?.position} />
    </div>
  );
}
