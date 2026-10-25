"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import { useDecorationReactions } from "@/app/laundromat/decorations/use-decoration-reactions";
import { useLaundromatCopy } from "@/app/laundromat/i18n/use-laundromat-copy";
import { useLocalWeather } from "@/app/laundromat/local-weather/use-local-weather";
import { BasketDrawing } from "@/app/laundromat/objects/basket-drawing";
import { InstantCameraDrawing } from "@/app/laundromat/objects/instant-camera-drawing";
import { SceneTooltip } from "@/app/laundromat/scene-tooltip";
import { useSoundBoard } from "@/app/laundromat/sound/use-sound-board";
import { useSceneHour } from "@/app/laundromat/use-scene-hour";
import type {
  BedroomConfig,
  GarmentKind,
} from "@/lib/laundromat/first-visit/bedroom-config";
import { describeHamperBasket } from "@/lib/laundromat/first-visit/describe-hamper-basket";
import { getBedroomMode } from "@/lib/laundromat/first-visit/get-bedroom-mode";
import { getBedroomWindowLight } from "@/lib/laundromat/first-visit/get-bedroom-window-light";
import { getCoverScale } from "@/lib/laundromat/first-visit/get-cover-scale";
import { getCurtainLayout } from "@/lib/laundromat/first-visit/get-curtain-layout";
import { getGarmentFootprint } from "@/lib/laundromat/first-visit/get-garment-footprint";
import { getHamperBasket } from "@/lib/laundromat/first-visit/get-hamper-basket";
import { getTableLampShape } from "@/lib/laundromat/first-visit/get-table-lamp-shape";
import { getTossFlight } from "@/lib/laundromat/first-visit/get-toss-flight";
import { isBedtime } from "@/lib/laundromat/first-visit/is-bedtime";
import { getBoxFaces } from "@/lib/laundromat/get-box-faces";
import { getFacePlane } from "@/lib/laundromat/get-face-plane";
import { getTimeOfDay } from "@/lib/laundromat/get-time-of-day";
import { GOOD_NIGHT_MUSIC } from "@/lib/laundromat/good-night-music";
import type { Homecoming } from "@/lib/laundromat/laundry/get-homecoming";
import type { ScreenPoint } from "@/lib/laundromat/project-iso-point";
import { projectIsoPoint } from "@/lib/laundromat/project-iso-point";
import type { SceneConfig, SceneObject } from "@/lib/laundromat/scene-config";
import { getWindowWeather } from "@/lib/laundromat/weather/get-window-weather";
import { cn } from "@/lib/utils";

import { BedroomDecorationTargets } from "./bedroom-decoration-targets";
import { BedroomDoor } from "./bedroom-door";
import { BedroomDrawing } from "./bedroom-drawing";
import { CrumpledBall } from "./crumpled-ball";
import { GarmentDrawing } from "./garment-drawing";
import { GoodNightDrop } from "./good-night-drop";
import { HamperBasketDrawing } from "./hamper-basket-drawing";
import { RoomDarkness } from "./room-darkness";
import { useCurtainPose } from "./use-curtain-pose";
import { useIdleNudge } from "./use-idle-nudge";

const DRAG_THRESHOLD_PX = 4;
const HIT_PADDING_PX = 4;
const LAND_DELAY_MS = 90;
const SETTLE_CLEAR_DELAY_MS = 40;
const COS_30 = Math.cos(Math.PI / 6);
const SIN_30 = Math.sin(Math.PI / 6);
const PUSH_EASE: [number, number, number, number] = [0.65, 0, 0.35, 1];
const FADE_OUT_EASE: [number, number, number, number] = [0.55, 0, 1, 0.45];

type Flight = {
  kind: GarmentKind;
  from: ScreenPoint;
  isDrop: boolean;
  path: ReturnType<typeof getTossFlight>;
};

type Drag = {
  kind: GarmentKind;
  startX: number;
  startY: number;
  dx: number;
  dy: number;
  moved: boolean;
};

type Hover =
  | GarmentKind
  | "basket"
  | "door"
  | "lamp"
  | "curtain"
  | "bed"
  | "camera";

type Phase = "room" | "opening" | "entering";

type Fit = {
  scale: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

type FirstVisitProps = {
  scene: SceneConfig;
  bedroom: BedroomConfig;
  hourOverride?: number;
  home: Homecoming;
  cleanPile: boolean;
  lampSwitch: boolean | undefined;
  curtainOpen: boolean;
  onLampSwitch: (on: boolean) => void;
  onCurtainOpenChange: (open: boolean) => void;
  onWalkIn: () => void;
  onListen: () => void;
  cameraHeld: boolean;
  onPickUpCamera: () => void;
};

export function FirstVisit(props: FirstVisitProps) {
  const { copy } = useLaundromatCopy();
  const { bedroom, scene } = props;
  const { projection, stage, door, room } = bedroom;
  const { roomPaddingRatio } = scene.camera;
  const { walkIn } = bedroom.motion;
  const prefersReducedMotion = useReducedMotion() ?? false;
  const sceneHour = useSceneHour();
  const hour = props.hourOverride ?? sceneHour;
  const timeOfDay =
    hour === undefined ? undefined : getTimeOfDay({ hour, config: scene });

  const rootRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<number[]>([]);
  const [fit, setFit] = useState<Fit>();
  const [inBasket, setInBasket] = useState<
    { kind: GarmentKind; slotIndex: number }[]
  >([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [drag, setDrag] = useState<Drag>();
  const [settling, setSettling] = useState<GarmentKind>();
  const [hover, setHover] = useState<Hover>();
  const sound = useSoundBoard();
  const decorations = useDecorationReactions(props.scene.details);
  const { reading: weather } = useLocalWeather();
  const isLampOn = props.lampSwitch ?? (timeOfDay?.lampIntensity ?? 1) > 0.5;
  const isCurtainOpen = props.curtainOpen;
  const [isTouched, setIsTouched] = useState(false);
  const [phase, setPhase] = useState<Phase>("room");
  const [jiggles, setJiggles] = useState(0);
  const [bumps, setBumps] = useState(0);
  const [bedtime, setBedtime] = useState<{
    audio: HTMLAudioElement;
    playback: Promise<void>;
  }>();
  const musicRef = useRef<HTMLAudioElement>(undefined);

  const mode = getBedroomMode({ home: props.home });
  const { basket: roomBasket } = mode;
  const kinds = mode.hasFloorClothes
    ? bedroom.garments.map((garment) => garment.kind)
    : [];
  const unavailable = [
    ...inBasket.map((item) => item.kind),
    ...flights.map((flight) => flight.kind),
  ];
  const { nudge, resetIdle } = useIdleNudge({
    kinds,
    unavailable,
    isPaused: drag !== undefined || hover !== undefined,
    isStopped: isTouched || phase !== "room" || !mode.hasFloorClothes,
    config: bedroom.motion.nudge,
  });

  useEffect(() => {
    const root = rootRef.current;
    if (root === null) return;
    const corners = [0, room.width].flatMap((x) =>
      [0, room.depth].flatMap((y) =>
        [0, room.wallHeight].map((z) =>
          projectIsoPoint({ point: { x, y, z }, projection })
        )
      )
    );
    const left = Math.min(...corners.map((corner) => corner.x));
    const right = Math.max(...corners.map((corner) => corner.x));
    const top = Math.min(...corners.map((corner) => corner.y));
    const bottom = Math.max(...corners.map((corner) => corner.y));
    const fill = 1 - 2 * roomPaddingRatio;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const scale = Math.min(
        (width * fill) / (right - left),
        (height * fill) / (bottom - top)
      );
      setFit({
        scale,
        x: width / 2 - ((left + right) / 2) * scale,
        y: height / 2 - ((top + bottom) / 2) * scale,
        width,
        height,
      });
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, [room, projection, roomPaddingRatio]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  function later(delayMs: number, run: () => void) {
    timersRef.current.push(window.setTimeout(run, delayMs));
  }

  const floorPlane = `${getFacePlane({ plane: "top", origin: { x: 0, y: 0, z: 0 }, projection }).transform} scale(${projection.unit})`;
  const basket = getHamperBasket({ basket: bedroom.basket, projection });
  const carriedBasket = {
    id: "carried-basket",
    kind: "basket",
    position: {
      x: bedroom.basket.center.x - bedroom.basket.radius,
      y: bedroom.basket.center.y - bedroom.basket.radius,
      z: 0,
    },
    size: {
      w: bedroom.basket.radius * 2,
      d: bedroom.basket.radius * 2,
      h: bedroom.basket.height,
    },
  } satisfies SceneObject;
  const basketBounds = (() => {
    if (roomBasket.kind !== "carried") return basket.bounds;
    const { position, size } = carriedBasket;
    const corners = [0, size.w].flatMap((dx) =>
      [0, size.d].flatMap((dy) =>
        [0, size.h].map((dz) =>
          projectIsoPoint({
            point: {
              x: position.x + dx,
              y: position.y + dy,
              z: position.z + dz,
            },
            projection,
          })
        )
      )
    );
    const xs = corners.map((corner) => corner.x);
    const ys = corners.map((corner) => corner.y);
    return {
      x: Math.min(...xs),
      y: Math.min(...ys),
      width: Math.max(...xs) - Math.min(...xs),
      height: Math.max(...ys) - Math.min(...ys),
    };
  })();
  const footprints = Object.fromEntries(
    bedroom.garments.map((garment) => [
      garment.kind,
      getGarmentFootprint({ garment, projection }),
    ])
  );
  const lampTableTop =
    bedroom.bedsideTable.position.z + bedroom.bedsideTable.size.h;
  const lampTop = projectIsoPoint({
    point: {
      ...bedroom.lamp.center,
      z:
        lampTableTop +
        getTableLampShape({
          center: bedroom.lamp.center,
          tableTop: lampTableTop,
          domeRadius: bedroom.lamp.shadeRadius,
          projection,
        }).height,
    },
    projection,
  });
  const lampBottom = projectIsoPoint({
    point: { ...bedroom.lamp.center, z: lampTableTop },
    projection,
  });
  const lampHitWidth = bedroom.lamp.shadeRadius * 2.4 * projection.unit;
  const cameraBounds = (() => {
    const { position, size } = bedroom.instantCamera;
    const corners = [0, size.w].flatMap((dx) =>
      [0, size.d].flatMap((dy) =>
        [0, size.h * 1.26].map((dz) =>
          projectIsoPoint({
            point: {
              x: position.x + dx,
              y: position.y + dy,
              z: position.z + dz,
            },
            projection,
          })
        )
      )
    );
    const left = Math.min(...corners.map((corner) => corner.x));
    const top = Math.min(...corners.map((corner) => corner.y));
    return {
      x: left,
      y: top,
      width: Math.max(...corners.map((corner) => corner.x)) - left,
      height: Math.max(...corners.map((corner) => corner.y)) - top,
    };
  })();
  const curtainLayout = getCurtainLayout({
    window: bedroom.window,
    curtain: bedroom.curtain,
  });
  const curtainPose = useCurtainPose({
    open: isCurtainOpen,
    layout: curtainLayout,
    rings: bedroom.curtain.rings,
    motion: bedroom.motion.curtain,
    reducedMotion: prefersReducedMotion,
  });
  const windowLight =
    timeOfDay === undefined
      ? undefined
      : getBedroomWindowLight({
          timeOfDay,
          sky: scene.sky,
          sunlight: getWindowWeather(weather?.condition).sunlight,
        });
  const curtainTopLeft = projectIsoPoint({
    point: {
      x: curtainLayout.rodX,
      y: curtainLayout.opening.far + bedroom.curtain.stackOutset,
      z: curtainLayout.top,
    },
    projection,
  });
  const doorTopLeft = projectIsoPoint({
    point: { x: 0, y: door.fromY + door.width, z: door.height },
    projection,
  });
  const doorway = projectIsoPoint({
    point: { x: 0, y: door.fromY + door.width / 2, z: door.height / 2 },
    projection,
  });
  const doorwayOutline = [
    { y: door.fromY, z: 0 },
    { y: door.fromY + door.width, z: 0 },
    { y: door.fromY + door.width, z: door.height },
    { y: door.fromY, z: door.height },
  ].map((corner) =>
    projectIsoPoint({ point: { x: 0, ...corner }, projection })
  );
  const isReady = mode.isDoorOpen || inBasket.length > 0;
  const isInRoom = phase === "room";
  const canSleep =
    isInRoom &&
    bedtime === undefined &&
    isBedtime({ timeOfDay, isLampOn, isCurtainOpen });
  const { bed } = bedroom;
  const bedOutline = getBoxFaces({
    position: bed.headboard.position,
    size: {
      w: bed.frame.position.x + bed.frame.size.w - bed.headboard.position.x,
      d:
        bed.mattress.position.y +
        bed.mattress.size.d +
        bed.overhang -
        bed.headboard.position.y,
      h: bed.headboard.size.h,
    },
    projection,
  }).outline;
  const bedBounds = (() => {
    const xs = bedOutline.map((point) => point.x);
    const ys = bedOutline.map((point) => point.y);
    const x = Math.min(...xs);
    const y = Math.min(...ys);
    return { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y };
  })();

  function isOverBasket(point: ScreenPoint) {
    const zone = basket.dropZone;
    return (
      point.x >= zone.x &&
      point.x <= zone.x + zone.width &&
      point.y >= zone.y &&
      point.y <= zone.y + zone.height
    );
  }

  function toss(options: {
    kind: GarmentKind;
    from: ScreenPoint;
    isDrop: boolean;
  }) {
    const { kind } = options;
    if (unavailable.includes(kind)) return;
    setIsTouched(true);
    setHover(undefined);
    const slotIndex = inBasket.length + flights.length;
    if (prefersReducedMotion) {
      setInBasket((current) => [...current, { kind, slotIndex }]);
      return;
    }
    const path = getTossFlight({
      from: options.from,
      mouth: basket.mouth,
      slotIndex,
      drop: options.isDrop,
      motion: bedroom.motion,
    });
    setFlights((current) => [
      ...current,
      { kind, from: options.from, isDrop: options.isDrop, path },
    ]);
    later(path.durationMs + LAND_DELAY_MS, () => {
      setFlights((current) => current.filter((flight) => flight.kind !== kind));
      setInBasket((current) => [...current, { kind, slotIndex }]);
      setBumps((current) => current + 1);
      sound?.play("collect-laundry", { volume: 0.35 });
    });
  }

  function focusAfterToss(kind: GarmentKind) {
    const next = kinds.find(
      (other) => other !== kind && !unavailable.includes(other)
    );
    const selector =
      next === undefined
        ? "[data-bedroom-door-target]"
        : `[data-garment-target="${next}"]`;
    requestAnimationFrame(() =>
      rootRef.current?.querySelector<HTMLElement>(selector)?.focus()
    );
  }

  function handleGarmentPointerDown(options: {
    event: React.PointerEvent<HTMLButtonElement>;
    kind: GarmentKind;
  }) {
    const { event } = options;
    if (event.button !== 0 || !isInRoom) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsTouched(true);
    setSettling(undefined);
    setDrag({
      kind: options.kind,
      startX: event.clientX,
      startY: event.clientY,
      dx: 0,
      dy: 0,
      moved: false,
    });
  }

  function handleGarmentPointerMove(event: React.PointerEvent) {
    if (drag === undefined || fit === undefined) return;
    const clientDx = event.clientX - drag.startX;
    const clientDy = event.clientY - drag.startY;
    setDrag({
      ...drag,
      dx: clientDx / fit.scale,
      dy: clientDy / fit.scale,
      moved: drag.moved || Math.hypot(clientDx, clientDy) > DRAG_THRESHOLD_PX,
    });
  }

  function settleBack(kind: GarmentKind) {
    setSettling(kind);
    later(bedroom.motion.settleMs + SETTLE_CLEAR_DELAY_MS, () =>
      setSettling((current) => (current === kind ? undefined : current))
    );
  }

  function handleGarmentPointerUp() {
    if (drag === undefined) return;
    setDrag(undefined);
    const { center } = footprints[drag.kind];
    const point = { x: center.x + drag.dx, y: center.y + drag.dy };
    const isOver = drag.moved && isOverBasket(point);
    if (!drag.moved || isOver) {
      toss({ kind: drag.kind, from: point, isDrop: isOver });
      return;
    }
    settleBack(drag.kind);
  }

  function handleGarmentPointerCancel() {
    if (drag === undefined) return;
    setDrag(undefined);
    settleBack(drag.kind);
  }

  function handleGarmentClick(options: {
    event: React.MouseEvent<HTMLButtonElement>;
    kind: GarmentKind;
  }) {
    if (options.event.detail !== 0 || !isInRoom) return;
    toss({
      kind: options.kind,
      from: footprints[options.kind].center,
      isDrop: false,
    });
    focusAfterToss(options.kind);
  }

  function handleHover(target: Hover) {
    setHover(target);
    resetIdle();
  }

  function clearHover(target: Hover) {
    setHover((current) => (current === target ? undefined : current));
  }

  function handleDoorClick() {
    if (!isInRoom || fit === undefined) return;
    if (!isReady) {
      sound?.play("door-locked");
      setJiggles((current) => current + 1);
      setHover("door");
      return;
    }
    setHover(undefined);
    setPhase("opening");
    sound?.play("room-door-open");
    props.onWalkIn();
    if (prefersReducedMotion) {
      setPhase("entering");
      return;
    }
    later(walkIn.pushStartMs, () => setPhase("entering"));
  }

  function handleLampClick() {
    sound?.play("coffee-switch", { volume: 0.7 });
    props.onLampSwitch(!isLampOn);
  }

  function handleCurtainClick() {
    props.onCurtainOpenChange(!isCurtainOpen);
  }

  function loadMusic() {
    musicRef.current ??= new Audio(GOOD_NIGHT_MUSIC.src);
    return musicRef.current;
  }

  function handleBedHover() {
    loadMusic();
    handleHover("bed");
  }

  function handleBedClick() {
    if (!canSleep) return;
    const audio = loadMusic();
    audio.volume = bedroom.motion.goodNight.volume;
    setHover(undefined);
    setBedtime({ audio, playback: audio.play() });
  }

  function handleBedFocus(event: React.FocusEvent<HTMLButtonElement>) {
    loadMusic();
    if (event.currentTarget.matches(":focus-visible")) setHover("bed");
  }

  function handleCurtainFocus(event: React.FocusEvent<HTMLButtonElement>) {
    if (event.currentTarget.matches(":focus-visible")) setHover("curtain");
  }

  function handleCameraClick() {
    setHover(undefined);
    props.onPickUpCamera();
  }

  function handleCameraFocus(event: React.FocusEvent<HTMLButtonElement>) {
    if (event.currentTarget.matches(":focus-visible")) setHover("camera");
  }

  function handleLampFocus(event: React.FocusEvent<HTMLButtonElement>) {
    if (event.currentTarget.matches(":focus-visible")) setHover("lamp");
  }

  function handleDoorFocus(event: React.FocusEvent<HTMLButtonElement>) {
    if (event.currentTarget.matches(":focus-visible")) setHover("door");
  }

  const tooltip = (() => {
    if (!isInRoom || fit === undefined) return undefined;
    const target = (() => {
      if (hover === "door") {
        return {
          text: (() => {
            if (props.home.kind === "away") {
              return copy.firstVisit.doorAwayTooltip;
            }
            return isReady
              ? copy.firstVisit.doorReadyTooltip
              : copy.firstVisit.doorWaitingTooltip;
          })(),
          at: projectIsoPoint({
            point: {
              x: 0,
              y: door.fromY + door.width / 2,
              z: door.height + 0.2,
            },
            projection,
          }),
        };
      }
      if (hover === "camera") {
        return {
          text: copy.instantCamera.objectTooltip,
          at: { x: cameraBounds.x + cameraBounds.width / 2, y: cameraBounds.y },
        };
      }
      if (hover === "lamp") {
        return {
          text: isLampOn
            ? copy.firstVisit.lampOffTooltip
            : copy.firstVisit.lampOnTooltip,
          at: { x: lampTop.x, y: lampTop.y - 4 },
        };
      }
      if (hover === "curtain") {
        return {
          text: isCurtainOpen
            ? copy.firstVisit.curtainCloseTooltip
            : copy.firstVisit.curtainOpenTooltip,
          at: projectIsoPoint({
            point: {
              x: curtainLayout.rodX,
              y: (curtainLayout.opening.near + curtainLayout.opening.far) / 2,
              z: curtainLayout.top + 0.2,
            },
            projection,
          }),
        };
      }
      if (hover === "bed" && canSleep) {
        return {
          text: copy.firstVisit.bedTooltip,
          at: projectIsoPoint({
            point: {
              x: bed.headboard.position.x + bed.headboard.size.w / 2,
              y: bed.headboard.position.y,
              z: bed.headboard.size.h + 0.2,
            },
            projection,
          }),
        };
      }
      if (hover === "basket" && drag === undefined) {
        return {
          text: (() => {
            switch (roomBasket.kind) {
              case "hamper":
                return describeHamperBasket({
                  count: inBasket.length,
                  total: kinds.length,
                  copy,
                });
              case "carried":
                return roomBasket.laundry === "wet"
                  ? copy.firstVisit.basketWet
                  : copy.firstVisit.basketFull;
              case "none":
                return undefined;
              default: {
                const unhandled: never = roomBasket;
                return unhandled;
              }
            }
          })(),
          at: { x: basket.mouth.x, y: basketBounds.y - 4 },
        };
      }
      return undefined;
    })();
    if (target === undefined) return undefined;
    return {
      text: target.text,
      position: {
        x: fit.x + target.at.x * fit.scale,
        y: fit.y + target.at.y * fit.scale,
      },
    };
  })();

  const stagePush = (() => {
    if (phase !== "entering") return undefined;
    if (prefersReducedMotion) {
      return {
        target: { opacity: 0 },
        transition: { duration: walkIn.reducedFadeMs / 1000 },
      };
    }
    if (fit === undefined) return undefined;
    const doorwayOnScreen = {
      x: fit.x + doorway.x * fit.scale,
      y: fit.y + doorway.y * fit.scale,
    };
    const coverScale = getCoverScale({
      polygon: doorwayOutline,
      center: doorway,
      view: {
        left: doorwayOnScreen.x / fit.scale,
        right: (fit.width - doorwayOnScreen.x) / fit.scale,
        top: doorwayOnScreen.y / fit.scale,
        bottom: (fit.height - doorwayOnScreen.y) / fit.scale,
      },
    });
    return {
      target: {
        scale: coverScale * walkIn.pushCoverMargin,
        filter: `blur(${walkIn.pushBlurPx}px)`,
      },
      transition: {
        scale: {
          duration: walkIn.lightInMs / 1000,
          ease: PUSH_EASE,
        },
        filter: {
          duration: walkIn.pushBlurMs / 1000,
          delay: walkIn.pushBlurDelayMs / 1000,
          ease: FADE_OUT_EASE,
        },
      },
    };
  })();

  function renderGarment(kind: GarmentKind) {
    const isDragging = drag?.kind === kind;
    const isLive = isDragging || hover === kind;
    return (
      <GarmentDrawing
        key={kind}
        kind={kind}
        floorPlane={floorPlane}
        footprint={footprints[kind].transform}
        offset={
          isDragging && drag !== undefined
            ? { x: drag.dx, y: drag.dy }
            : { x: 0, y: 0 }
        }
        live={isLive}
        lifted={hover === kind && !isDragging}
        settling={settling === kind}
        fading={flights.some((flight) => flight.kind === kind)}
        nudge={
          nudge?.kind === kind ? (nudge.count % 2 === 0 ? "a" : "b") : undefined
        }
        glowFilter="url(#lm-fv-glow)"
        liftPx={bedroom.motion.hoverLiftPx}
        settleMs={bedroom.motion.settleMs}
      />
    );
  }

  const onFloor = kinds.filter(
    (kind) =>
      !inBasket.some((item) => item.kind === kind) &&
      !flights.some((flight) => flight.kind === kind && flight.isDrop)
  );
  const onTop = onFloor.filter(
    (kind) =>
      (drag?.kind === kind || settling === kind) &&
      !flights.some((flight) => flight.kind === kind)
  );
  const isAccepting =
    drag !== undefined &&
    drag.moved &&
    isOverBasket({
      x: footprints[drag.kind].center.x + drag.dx,
      y: footprints[drag.kind].center.y + drag.dy,
    });

  return (
    <div
      ref={rootRef}
      data-first-visit
      className={cn(
        "absolute inset-0 overflow-hidden",
        !isInRoom && "pointer-events-none [&_a]:pointer-events-none"
      )}
    >
      {fit !== undefined && (
        <div
          className="absolute top-0 left-0 origin-top-left"
          style={{
            width: stage.width,
            height: stage.height,
            transform: `translate(${fit.x}px, ${fit.y}px) scale(${fit.scale})`,
          }}
        >
          <motion.div
            className="absolute inset-0"
            style={{
              transformOrigin: `${doorway.x}px ${doorway.y}px`,
              willChange:
                phase === "entering" ? "transform, filter" : undefined,
            }}
            initial={false}
            variants={{ rest: {}, push: stagePush?.target ?? {} }}
            animate={stagePush === undefined ? "rest" : "push"}
            transition={stagePush?.transition}
          >
            <svg
              aria-hidden
              data-instant-camera-subject="bedroom"
              width={stage.width}
              height={stage.height}
              viewBox={`0 0 ${stage.width} ${stage.height}`}
              className="pointer-events-none absolute top-0 left-0 overflow-visible"
            >
              <defs>
                <filter
                  id="lm-fv-glow"
                  filterUnits="userSpaceOnUse"
                  x={-stage.width}
                  y={-stage.height}
                  width={stage.width * 3}
                  height={stage.height * 3}
                >
                  <feGaussianBlur stdDeviation={2.2} result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter
                  id="lm-fv-glow-units"
                  filterUnits="userSpaceOnUse"
                  x={-2}
                  y={-2}
                  width={8}
                  height={8}
                >
                  <feGaussianBlur
                    stdDeviation={2.2 / projection.unit}
                    result="blur"
                  />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter
                  id="lm-fv-spill"
                  filterUnits="userSpaceOnUse"
                  x={0}
                  y={0}
                  width={stage.width}
                  height={stage.height}
                >
                  <feGaussianBlur stdDeviation={6} />
                </filter>
              </defs>
              <g
                className="[&_*]:[vector-effect:non-scaling-stroke]"
                strokeWidth={1}
              >
                <BedroomDrawing
                  decorationReactions={decorations.reactions}
                  bedroom={bedroom}
                  projection={projection}
                  timeOfDay={timeOfDay}
                  hour={hour}
                  scene={scene}
                  lampOn={isLampOn}
                  lampHighlighted={hover === "lamp"}
                  curtainPose={curtainPose}
                  curtainLayout={curtainLayout}
                  windowLight={windowLight}
                  curtainHighlighted={hover === "curtain"}
                  bedHighlighted={hover === "bed" && canSleep}
                  cleanPile={props.cleanPile}
                />
                {!props.cameraHeld && (
                  <InstantCameraDrawing
                    laidOut={{ object: bedroom.instantCamera }}
                    projection={projection}
                    highlighted={hover === "camera"}
                  />
                )}
                <BedroomDoor
                  door={door}
                  walkIn={walkIn}
                  projection={projection}
                  ready={isReady}
                  opening={phase !== "room"}
                  swings={!prefersReducedMotion}
                  jiggles={jiggles}
                  glowFilter="url(#lm-fv-glow-units)"
                  spillFilter="url(#lm-fv-spill)"
                />
                {onFloor
                  .filter((kind) => !onTop.includes(kind))
                  .map(renderGarment)}
                {(() => {
                  switch (roomBasket.kind) {
                    case "hamper":
                      return (
                        <HamperBasketDrawing
                          basket={basket}
                          pile={inBasket}
                          bumps={bumps}
                          highlighted={hover === "basket"}
                          accepting={isAccepting}
                          glowFilter="url(#lm-fv-glow)"
                        >
                          {flights.map((flight) => {
                            const durationS = flight.path.durationMs / 1000;
                            return (
                              <g
                                key={flight.kind}
                                transform={`translate(${flight.from.x} ${flight.from.y})`}
                              >
                                <motion.g
                                  initial={{ x: 0 }}
                                  animate={{ x: flight.path.dx }}
                                  transition={{
                                    duration: durationS,
                                    ease: [0.33, 0.66, 0.45, 1],
                                  }}
                                >
                                  <motion.g
                                    initial={{ y: 0 }}
                                    animate={{
                                      y: [0, flight.path.peak, flight.path.dy],
                                    }}
                                    transition={{
                                      duration: durationS,
                                      times: [0, 0.42, 1],
                                      ease: [
                                        [0.2, 0.65, 0.4, 1],
                                        [0.6, 0, 0.85, 0.45],
                                      ],
                                    }}
                                  >
                                    <motion.g
                                      initial={{ rotate: 0, scale: 1.08 }}
                                      animate={{
                                        rotate: flight.path.spinDeg,
                                        scale: 0.94,
                                      }}
                                      transition={{
                                        duration: durationS,
                                        ease: [0.3, 0.6, 0.45, 1],
                                      }}
                                    >
                                      <CrumpledBall />
                                    </motion.g>
                                  </motion.g>
                                </motion.g>
                              </g>
                            );
                          })}
                        </HamperBasketDrawing>
                      );
                    case "carried":
                      return (
                        <BasketDrawing
                          laidOut={{ object: carriedBasket }}
                          projection={projection}
                          highlighted={hover === "basket"}
                          contents={roomBasket.laundry}
                        />
                      );
                    case "none":
                      return null;
                    default: {
                      const unhandled: never = roomBasket;
                      return unhandled;
                    }
                  }
                })()}
                {onTop.map(renderGarment)}
                <RoomDarkness
                  pose={curtainPose}
                  layout={curtainLayout}
                  curtain={bedroom.curtain}
                  room={room}
                  projection={projection}
                  light={windowLight}
                  lampOn={isLampOn}
                  darknessScale={scene.light.darknessScale}
                />
              </g>
            </svg>

            {roomBasket.kind !== "none" && (
              <div
                aria-hidden
                className="absolute"
                style={{
                  left: basketBounds.x,
                  top: basketBounds.y,
                  width: basketBounds.width,
                  height: basketBounds.height,
                }}
                onPointerEnter={() => handleHover("basket")}
                onPointerLeave={() => clearHover("basket")}
              />
            )}
            {onFloor
              .filter((kind) => !flights.some((flight) => flight.kind === kind))
              .map((kind) => {
                const { bounds } = footprints[kind];
                const isDragging = drag?.kind === kind;
                const offset = isDragging ? drag : undefined;
                return (
                  <button
                    key={kind}
                    type="button"
                    data-garment-target={kind}
                    aria-label={copy.firstVisit.garmentLabel({
                      garment: copy.firstVisit.garments[kind],
                    })}
                    className="absolute touch-none rounded-md bg-transparent outline-none focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[var(--lm-ink)] focus-visible:outline-dashed"
                    style={{
                      left: bounds.x - HIT_PADDING_PX + (offset?.dx ?? 0),
                      top: bounds.y - HIT_PADDING_PX + (offset?.dy ?? 0),
                      width: bounds.width + HIT_PADDING_PX * 2,
                      height: bounds.height + HIT_PADDING_PX * 2,
                      cursor: isDragging && drag?.moved ? "grabbing" : "grab",
                    }}
                    onPointerDown={(event) =>
                      handleGarmentPointerDown({ event, kind })
                    }
                    onPointerMove={handleGarmentPointerMove}
                    onPointerUp={handleGarmentPointerUp}
                    onPointerCancel={handleGarmentPointerCancel}
                    onPointerEnter={() => handleHover(kind)}
                    onPointerLeave={() => clearHover(kind)}
                    onClick={(event) => handleGarmentClick({ event, kind })}
                  />
                );
              })}
            <BedroomDecorationTargets
              decorations={bedroom.decorations}
              projection={projection}
              onActivate={decorations.activate}
            />
            {canSleep && (
              <button
                type="button"
                aria-label={copy.firstVisit.bedLabel}
                className="absolute top-0 left-0 cursor-pointer bg-transparent outline-none focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[var(--lm-ink)] focus-visible:outline-dashed"
                style={{
                  left: bedBounds.x,
                  top: bedBounds.y,
                  width: bedBounds.width,
                  height: bedBounds.height,
                  clipPath: `polygon(${bedOutline
                    .map(
                      (point) =>
                        `${point.x - bedBounds.x}px ${point.y - bedBounds.y}px`
                    )
                    .join(", ")})`,
                }}
                onClick={handleBedClick}
                onPointerEnter={handleBedHover}
                onPointerLeave={() => clearHover("bed")}
                onFocus={handleBedFocus}
                onBlur={() => clearHover("bed")}
              />
            )}
            {!props.cameraHeld && (
              <button
                type="button"
                aria-label={copy.instantCamera.objectLabel}
                className="absolute cursor-pointer rounded-md bg-transparent outline-none focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[var(--lm-ink)] focus-visible:outline-dashed"
                style={{
                  left: cameraBounds.x - HIT_PADDING_PX,
                  top: cameraBounds.y - HIT_PADDING_PX,
                  width: cameraBounds.width + HIT_PADDING_PX * 2,
                  height: cameraBounds.height + HIT_PADDING_PX * 2,
                }}
                onClick={handleCameraClick}
                onPointerEnter={() => handleHover("camera")}
                onPointerLeave={() => clearHover("camera")}
                onFocus={handleCameraFocus}
                onBlur={() => clearHover("camera")}
              />
            )}
            <button
              type="button"
              aria-label={
                isLampOn
                  ? copy.firstVisit.lampOffLabel
                  : copy.firstVisit.lampOnLabel
              }
              aria-pressed={isLampOn}
              className="absolute cursor-pointer rounded-md bg-transparent outline-none focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[var(--lm-ink)] focus-visible:outline-dashed"
              style={{
                left: lampTop.x - lampHitWidth / 2,
                top: lampTop.y - HIT_PADDING_PX,
                width: lampHitWidth,
                height: lampBottom.y - lampTop.y + HIT_PADDING_PX,
              }}
              onClick={handleLampClick}
              onPointerEnter={() => handleHover("lamp")}
              onPointerLeave={() => clearHover("lamp")}
              onFocus={handleLampFocus}
              onBlur={() => clearHover("lamp")}
            />
            <div
              className="absolute top-0 left-0 origin-top-left"
              style={{
                transform: `matrix(${COS_30}, ${-SIN_30}, 0, 1, ${curtainTopLeft.x}, ${curtainTopLeft.y})`,
              }}
            >
              <button
                type="button"
                aria-label={
                  isCurtainOpen
                    ? copy.firstVisit.curtainCloseLabel
                    : copy.firstVisit.curtainOpenLabel
                }
                aria-pressed={!isCurtainOpen}
                className="absolute top-0 left-0 cursor-pointer rounded-md bg-transparent outline-none focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[var(--lm-ink)] focus-visible:outline-dashed"
                style={{
                  width:
                    (curtainLayout.openingWidth +
                      2 * bedroom.curtain.stackOutset) *
                    projection.unit,
                  height:
                    (curtainLayout.top - curtainLayout.bottom) *
                    projection.unit,
                }}
                onClick={handleCurtainClick}
                onPointerEnter={() => handleHover("curtain")}
                onPointerLeave={() => clearHover("curtain")}
                onFocus={handleCurtainFocus}
                onBlur={() => clearHover("curtain")}
              />
            </div>
            <div
              className="absolute top-0 left-0 origin-top-left"
              style={{
                transform: `matrix(${COS_30}, ${-SIN_30}, 0, 1, ${doorTopLeft.x}, ${doorTopLeft.y})`,
              }}
            >
              <button
                type="button"
                data-bedroom-door-target
                aria-label={(() => {
                  if (props.home.kind === "away") {
                    return copy.firstVisit.doorAwayLabel;
                  }
                  return isReady
                    ? copy.firstVisit.doorReadyLabel
                    : copy.firstVisit.doorWaitingLabel;
                })()}
                className="absolute top-0 left-0 cursor-pointer rounded-md bg-transparent outline-none focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[var(--lm-ink)] focus-visible:outline-dashed"
                style={{
                  width: door.width * projection.unit,
                  height: door.height * projection.unit,
                }}
                onClick={handleDoorClick}
                onPointerEnter={() => handleHover("door")}
                onPointerLeave={() => clearHover("door")}
                onFocus={handleDoorFocus}
                onBlur={() => clearHover("door")}
              />
            </div>
          </motion.div>
        </div>
      )}
      <SceneTooltip text={tooltip?.text} position={tooltip?.position} />
      {bedtime !== undefined && (
        <GoodNightDrop
          audio={bedtime.audio}
          playback={bedtime.playback}
          timing={bedroom.motion.goodNight}
        />
      )}
      {bedtime === undefined && (
        <button
          type="button"
          data-lm-control
          className="absolute right-[max(2.25rem,env(safe-area-inset-right))] bottom-[max(1.75rem,env(safe-area-inset-bottom))] cursor-pointer bg-transparent px-1.5 py-3 text-[11px] text-[var(--lm-line)] lowercase transition-colors duration-200 outline-none hover:text-[var(--lm-ink)] focus-visible:outline-1 focus-visible:outline-[var(--lm-line)] focus-visible:outline-dashed"
          onClick={props.onListen}
        >
          {copy.firstVisit.justListen}
        </button>
      )}
    </div>
  );
}
