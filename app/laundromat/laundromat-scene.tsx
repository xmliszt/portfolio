"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import type { CameraFocus } from "@/lib/laundromat/parse-camera-focus";
import { parseCameraFocus } from "@/lib/laundromat/parse-camera-focus";
import type { FocusTarget, SceneConfig } from "@/lib/laundromat/scene-config";
import { cn } from "@/lib/utils";

import { HitTargetButton } from "./hit-target-button";
import { RoomDrawing } from "./room-drawing";
import { SceneTooltip } from "./scene-tooltip";
import { useSceneHour } from "./use-scene-hour";

const SCENE_UNIT_PX = 40;
const TOOLTIP_DELAY_MS = 300;
const FOCUS_TARGETS = ["shelf", "notebook"] satisfies FocusTarget[];

function getFocusedObjectId(options: {
  focus: CameraFocus;
  config: SceneConfig;
}) {
  return options.focus === "room"
    ? undefined
    : options.config.camera.focusTargets[options.focus].objectId;
}

function findFocusTarget(options: { objectId: string; config: SceneConfig }) {
  return FOCUS_TARGETS.find(
    (target) =>
      options.config.camera.focusTargets[target].objectId === options.objectId
  );
}

type LaundromatSceneProps = {
  config: SceneConfig;
  hourOverride?: number;
};

export function LaundromatScene(props: LaundromatSceneProps) {
  const { config } = props;
  const layout = useMemo(
    () => buildSceneLayout({ config, unit: SCENE_UNIT_PX }),
    [config]
  );
  const router = useRouter();
  const searchParams = useSearchParams();
  const focus = parseCameraFocus(searchParams.get("focus"));
  const focusedObjectId = getFocusedObjectId({ focus, config });
  const prefersReducedMotion = useReducedMotion() ?? false;
  const sceneHour = useSceneHour();
  const hour = props.hourOverride ?? sceneHour;

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
    const camera = computeCamera({ focus, viewport, layout, config });
    const previous = previousCameraRef.current;
    previousCameraRef.current = { camera, focus };

    function jumpTo(target: Camera) {
      cameraX.set(target.x);
      cameraY.set(target.y);
      cameraScale.set(target.scale);
    }

    const from =
      previous?.camera ??
      computeCamera({ focus: "room", viewport, layout, config });
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
          config,
        }) / 1000,
      ease: config.camera.ease,
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
    layout,
    config,
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
    const objectId =
      focusedObjectId ?? getFocusedObjectId({ focus: previousFocus, config });
    if (objectId !== undefined) {
      rootRef.current
        ?.querySelector<HTMLButtonElement>(`[data-hit-target="${objectId}"]`)
        ?.focus({ preventScroll: true });
    }
  }, [focus, focusedObjectId, config]);

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
    const target = findFocusTarget({ objectId, config });
    if (target !== undefined) {
      if (target !== focus) setFocus(target);
      return;
    }
    if (focus !== "room") setFocus("room");
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
    const laidOut = layout.objects.find(
      ({ object }) => object.id === tooltipId
    );
    if (laidOut === undefined) return undefined;
    const camera = computeCamera({ focus, viewport, layout, config });
    return {
      text: describeSceneObject(laidOut.object)?.tooltip,
      position: {
        x:
          (laidOut.bounds.x + laidOut.bounds.width / 2) * camera.scale +
          camera.x,
        y: laidOut.bounds.y * camera.scale + camera.y,
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
          dimAmount={config.camera.unfocusedDim}
          hour={hour}
          config={config}
        />
        {layout.objects.map((laidOut) => {
          const description = describeSceneObject(laidOut.object);
          if (description === undefined) return null;
          const { id } = laidOut.object;
          const focusTarget = findFocusTarget({ objectId: id, config });
          return (
            <HitTargetButton
              key={id}
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
          );
        })}
      </motion.div>
      <SceneTooltip text={tooltip?.text} position={tooltip?.position} />
    </div>
  );
}
