"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";

import type { LaidOutControl } from "@/lib/laundromat/build-scene-layout";
import { buildSceneLayout } from "@/lib/laundromat/build-scene-layout";
import { describeCoffeeMachine } from "@/lib/laundromat/coffee/describe-coffee-machine";
import { describeCoffeeSwitch } from "@/lib/laundromat/coffee/describe-coffee-switch";
import type { Camera, Viewport } from "@/lib/laundromat/compute-camera";
import { computeCamera } from "@/lib/laundromat/compute-camera";
import { describeSceneObject } from "@/lib/laundromat/describe-scene-object";
import { getCameraMoveDurationMs } from "@/lib/laundromat/get-camera-move-duration-ms";
import { describeMachine } from "@/lib/laundromat/laundry/describe-machine";
import type { MachineControl } from "@/lib/laundromat/laundry/describe-machine-control";
import { describeMachineControl } from "@/lib/laundromat/laundry/describe-machine-control";
import { formatRemainingTime } from "@/lib/laundromat/laundry/format-remaining-time";
import { getBasketContents } from "@/lib/laundromat/laundry/get-basket-contents";
import { getCycleMinutes } from "@/lib/laundromat/laundry/get-cycle-minutes";
import { getMachineStatus } from "@/lib/laundromat/laundry/get-machine-status";
import { describeShelfBook } from "@/lib/laundromat/notebook/describe-shelf-book";
import { getShelfBookId } from "@/lib/laundromat/notebook/get-shelf-book-id";
import { getShelfBookOutline } from "@/lib/laundromat/notebook/get-shelf-book-outline";
import { getShelfBookPlacements } from "@/lib/laundromat/notebook/get-shelf-book-placements";
import type { CameraFocus } from "@/lib/laundromat/parse-camera-focus";
import { parseCameraFocus } from "@/lib/laundromat/parse-camera-focus";
import type { FocusTarget, SceneConfig } from "@/lib/laundromat/scene-config";
import { describeTv } from "@/lib/laundromat/tv/describe-tv";
import type { TvControl } from "@/lib/laundromat/tv/describe-tv-control";
import { describeTvControl } from "@/lib/laundromat/tv/describe-tv-control";
import { getYouTubeWatchUrl } from "@/lib/laundromat/tv/get-youtube-watch-url";
import { cn } from "@/lib/utils";

import { NotebookBook } from "./notebook/notebook-book";
import { ShelfBookButton } from "./notebook/shelf-book-button";
import { useNotebookShelf } from "./notebook/use-notebook-shelf";
import type { SceneViews } from "./objects/scene-views";
import { HitTargetButton } from "./hit-target-button";
import { RoomDrawing } from "./room-drawing";
import { SceneControlButton } from "./scene-control-button";
import { SceneTooltip } from "./scene-tooltip";
import { useLaundry } from "./use-laundry";
import { useRoomAppliances } from "./use-room-appliances";
import { useSceneHour } from "./use-scene-hour";
import { useTvAudio } from "./use-tv-audio";

const SCENE_UNIT_PX = 40;
const TOOLTIP_DELAY_MS = 300;
const FOCUS_TARGETS = ["shelf", "notebook"] satisfies FocusTarget[];
const DIAL_DEGREES_PER_DETENT = 60;
const KNOB_CONTROLS: LaidOutControl["control"][] = ["dial", "tuner", "volume"];

function getFocusedObjectId(options: {
  focus: CameraFocus;
  config: SceneConfig;
}) {
  return options.focus === "room"
    ? undefined
    : options.config.camera.focusTargets[options.focus].objectId;
}

function parseBookNumber(value: string | null) {
  const number = Number.parseInt(value ?? "", 10);
  return Number.isInteger(number) && number > 0 ? number : undefined;
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
  const bookNumber =
    focus === "notebook" ? parseBookNumber(searchParams.get("book")) : undefined;
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
  const laundry = useLaundry();
  const appliances = useRoomAppliances(config);
  const notebookShelf = useNotebookShelf();
  const shelf = notebookShelf.shelf;
  const filledBooks = shelf?.kind === "online" ? shelf.books : [];
  const coverNumber =
    shelf?.kind === "online"
      ? shelf.currentNumber
      : config.details.notebook.coverNumber;
  const notebookObjectId = config.camera.focusTargets.notebook.objectId;
  const shelfObject = layout.objects.find(
    ({ object }) => object.id === config.camera.focusTargets.shelf.objectId
  )?.object;
  const shelfBooks =
    shelfObject === undefined
      ? []
      : getShelfBookPlacements({
          shelf: shelfObject,
          bookNumbers: filledBooks.map(({ number }) => number),
          lean: config.details.shelf.bookLean,
        }).flatMap((placement) => {
          const book = filledBooks.find(
            ({ number }) => number === placement.number
          );
          if (book === undefined) return [];
          return [
            {
              id: getShelfBookId(placement.number),
              number: placement.number,
              ...getShelfBookOutline({
                book: placement,
                projection: layout.projection,
              }),
              ...describeShelfBook({
                number: book.number,
                startedAtMs: Date.parse(book.startedAt),
                filledAtMs: Date.parse(book.filledAt),
                entryCount: book.entryCount,
              }),
            },
          ];
        });
  const tvSettings = config.details.tv;
  const {
    setContainer: setTvAudioContainer,
    audioState: tvAudioState,
    isNoSignal: isTvNoSignal,
  } = useTvAudio({
    tv: appliances.tv,
    details: tvSettings,
    onSkipStation: () => appliances.dispatchTv({ type: "tune", step: 1 }),
  });

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
        machines: config.machines,
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
            doorOpen: false,
          },
        ],
      ];
    })
  );
  type MachineView = (typeof machineViews)[string];
  const views: SceneViews = {
    machines: machineViews,
    tv: { state: appliances.tv, noSignal: isTvNoSignal },
    coffee: appliances.coffee,
    basket: getBasketContents(laundry.state.load),
    shelfBookNumbers: filledBooks.map(({ number }) => number),
    notebookNumber: coverNumber,
  };

  function describeControl(options: {
    objectId: string;
    control: LaidOutControl;
  }) {
    const { control } = options;
    switch (control.target) {
      case "machine": {
        const view = machineViews[options.objectId];
        if (view === undefined) return undefined;
        return describeMachineControl({
          control: control.control,
          machine: view.machine,
          status: view.status,
          minutes: view.cycle.minutes,
          nextMinutes: view.cycle.next,
          notifications: laundry.notifications,
        });
      }
      case "tv":
        return describeTvControl({
          control: control.control,
          state: appliances.tv,
          settings: tvSettings,
        });
      case "coffee":
        return describeCoffeeSwitch(appliances.coffee);
      default: {
        const unhandled: never = control;
        return unhandled;
      }
    }
  }

  function describeObject(objectId: string) {
    const view = machineViews[objectId];
    if (view !== undefined) return describeMachine(view);
    const laidOut = layout.objects.find(({ object }) => object.id === objectId);
    if (laidOut === undefined) return undefined;
    switch (laidOut.object.kind) {
      case "tv":
        return describeTv({ state: appliances.tv, settings: tvSettings });
      case "coffee-machine":
        return describeCoffeeMachine(appliances.coffee);
      default:
        return describeSceneObject(laidOut.object);
    }
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

  function setFocus(next: CameraFocus, book?: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "room") params.delete("focus");
    else params.set("focus", next);
    if (book === undefined) params.delete("book");
    else params.set("book", String(book));
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

  function handleControlPress(options: {
    objectId: string;
    control: LaidOutControl;
    step: 1 | -1;
  }) {
    const { control, step } = options;
    if (focus !== "room") {
      setFocus("room");
      return;
    }
    switch (control.target) {
      case "machine": {
        const view = machineViews[options.objectId];
        if (view !== undefined) {
          pressMachineControl({ view, control: control.control, step });
        }
        return;
      }
      case "tv":
        pressTvControl({ control: control.control, step });
        return;
      case "coffee":
        appliances.brew();
        return;
      default: {
        const unhandled: never = control;
        return unhandled;
      }
    }
  }

  function pressTvControl(options: { control: TvControl; step: 1 | -1 }) {
    switch (options.control) {
      case "tuner":
        appliances.dispatchTv({ type: "tune", step: options.step });
        return;
      case "volume":
        appliances.dispatchTv({ type: "volume", step: options.step });
        return;
      case "screen": {
        const station = tvSettings.stations[appliances.tv.station];
        if (appliances.tv.on && station !== undefined) {
          window.open(
            getYouTubeWatchUrl(station.videoId),
            "_blank",
            "noopener,noreferrer"
          );
          return;
        }
        appliances.dispatchTv({ type: "power" });
        return;
      }
      case "power":
        appliances.dispatchTv({ type: "power" });
        return;
      default: {
        const unhandled: never = options.control;
        return unhandled;
      }
    }
  }

  function pressMachineControl(options: {
    view: MachineView;
    control: MachineControl;
    step: 1 | -1;
  }) {
    const { view, control, step } = options;
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
      event.target.closest("[data-hit-target], [data-notebook]") !== null;
    if (!isOnHitTarget) setFocus("room");
  }

  const tooltip = (() => {
    if (tooltipId === undefined || viewport === undefined) return undefined;
    if (focus === "notebook") return undefined;
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
          text: () =>
            describeControl({ objectId: laidOut.object.id, control })?.tooltip,
        })),
      ])
      .concat(
        shelfBooks.map((book) => ({
          id: book.id,
          bounds: book.bounds,
          text: () => book.tooltip,
        }))
      )
      .find(({ id }) => id === tooltipId);
    if (target === undefined) return undefined;
    const camera = computeCamera({ focus, viewport, layout, config });
    return {
      text: target.text(),
      position: {
        x:
          (target.bounds.x + target.bounds.width / 2) * camera.scale + camera.x,
        y: target.bounds.y * camera.scale + camera.y,
      },
    };
  })();

  const bookLift = (() => {
    if (viewport === undefined) return undefined;
    const page = config.notebook.page;
    const bookWidth = page.width * 2;
    const bookHeight = page.height + config.notebook.statusBarPx;
    const fill = config.notebook.bookViewportFill;
    const scale = Math.min(
      (viewport.width * fill) / bookWidth,
      (viewport.height * fill) / bookHeight
    );
    const to = { x: 0, y: 0, scale, opacity: 1 };
    const notebookObject = layout.objects.find(
      ({ object }) => object.id === notebookObjectId
    );
    if (notebookObject === undefined || prefersReducedMotion) {
      return { from: { ...to, opacity: 0 }, to };
    }
    const camera = computeCamera({
      focus: "notebook",
      viewport,
      layout,
      config,
    });
    const { bounds } = notebookObject;
    const centerX = (bounds.x + bounds.width / 2) * camera.scale + camera.x;
    const centerY = (bounds.y + bounds.height / 2) * camera.scale + camera.y;
    return {
      from: {
        x: centerX - viewport.width / 2,
        y: centerY - viewport.height / 2,
        scale: (bounds.width * camera.scale) / page.width,
        opacity: 0,
      },
      to,
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
          hiddenObjectId={focus === "notebook" ? notebookObjectId : undefined}
          dimAmount={config.camera.unfocusedDim}
          views={views}
          hour={hour}
          config={config}
        />
        {layout.objects.map((laidOut) => {
          const { id } = laidOut.object;
          const description = describeObject(id);
          if (description === undefined) return null;
          const focusTarget = findFocusTarget({ objectId: id, config });
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
              {laidOut.controls.map((control) => {
                const controlDescription = describeControl({
                  objectId: id,
                  control,
                });
                if (controlDescription === undefined) return null;
                return (
                  <SceneControlButton
                    key={control.id}
                    control={control}
                    knob={KNOB_CONTROLS.includes(control.control)}
                    label={controlDescription.label}
                    enabled={controlDescription.enabled}
                    onPress={() =>
                      handleControlPress({ objectId: id, control, step: 1 })
                    }
                    onStepBack={() =>
                      handleControlPress({ objectId: id, control, step: -1 })
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
        {focus === "shelf" &&
          shelfBooks.map((book) => (
            <ShelfBookButton
              key={book.id}
              id={book.id}
              outline={book.outline}
              bounds={book.bounds}
              label={book.label}
              onActivate={() => setFocus("notebook", book.number)}
              onPointerShowTooltip={() =>
                showTooltip({ objectId: book.id, source: "pointer" })
              }
              onKeyboardShowTooltip={() =>
                showTooltip({ objectId: book.id, source: "keyboard" })
              }
              onHideTooltip={() => hideTooltip(book.id)}
            />
          ))}
      </motion.div>
      <AnimatePresence>
        {focus === "notebook" && bookLift !== undefined && (
          <motion.div
            key="notebook"
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <motion.div
              className="pointer-events-auto origin-center"
              initial={bookLift.from}
              animate={bookLift.to}
              exit={{ ...bookLift.from, transition: { duration: 0.32 } }}
              transition={{
                duration: prefersReducedMotion
                  ? 0.2
                  : config.details.notebook.liftMs / 1000,
                ease: config.camera.ease,
              }}
            >
              <NotebookBook
                key={bookNumber ?? "current"}
                config={config}
                bookNumber={bookNumber}
                coverNumber={coverNumber}
                reducedMotion={prefersReducedMotion}
                onPlaced={() => void notebookShelf.refresh()}
                onClose={() => setFocus("room")}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <SceneTooltip text={tooltip?.text} position={tooltip?.position} />
      <div
        ref={setTvAudioContainer}
        data-audio-state={tvAudioState}
        aria-hidden
        className="pointer-events-none fixed top-full left-full size-[200px] overflow-hidden"
      />
    </div>
  );
}
