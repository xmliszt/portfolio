"use client";

import {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useSearchParams } from "next/navigation";

import { getBoardFrame } from "@/lib/laundromat/board/get-board-frame";
import type { LaidOutControl } from "@/lib/laundromat/build-scene-layout";
import { buildSceneLayout } from "@/lib/laundromat/build-scene-layout";
import { describeCoffeeCup } from "@/lib/laundromat/coffee/describe-coffee-cup";
import { describeCoffeeFlask } from "@/lib/laundromat/coffee/describe-coffee-flask";
import { describeCoffeeMachine } from "@/lib/laundromat/coffee/describe-coffee-machine";
import { describeCoffeeSwitch } from "@/lib/laundromat/coffee/describe-coffee-switch";
import type { Camera, Viewport } from "@/lib/laundromat/compute-camera";
import { computeCamera } from "@/lib/laundromat/compute-camera";
import { describeSceneObject } from "@/lib/laundromat/describe-scene-object";
import { getCameraMoveDurationMs } from "@/lib/laundromat/get-camera-move-duration-ms";
import { getDaylitTokenStyle } from "@/lib/laundromat/get-daylit-token-style";
import { getTimeOfDay } from "@/lib/laundromat/get-time-of-day";
import { describeEntranceMat } from "@/lib/laundromat/laundry/describe-entrance-mat";
import { describeLaundryBasket } from "@/lib/laundromat/laundry/describe-laundry-basket";
import { describeMachine } from "@/lib/laundromat/laundry/describe-machine";
import type { MachineControl } from "@/lib/laundromat/laundry/describe-machine-control";
import { describeMachineControl } from "@/lib/laundromat/laundry/describe-machine-control";
import { formatRemainingTime } from "@/lib/laundromat/laundry/format-remaining-time";
import { getBasketContents } from "@/lib/laundromat/laundry/get-basket-contents";
import { getCycleMinutes } from "@/lib/laundromat/laundry/get-cycle-minutes";
import { getDialAngleDeg } from "@/lib/laundromat/laundry/get-dial-angle-deg";
import type { Homecoming } from "@/lib/laundromat/laundry/get-homecoming";
import { getHomecoming } from "@/lib/laundromat/laundry/get-homecoming";
import type { MachineStatus } from "@/lib/laundromat/laundry/get-machine-status";
import { getMachineStatus } from "@/lib/laundromat/laundry/get-machine-status";
import { describeShelf } from "@/lib/laundromat/notebook/describe-shelf";
import { describeShelfBook } from "@/lib/laundromat/notebook/describe-shelf-book";
import { getShelfBookId } from "@/lib/laundromat/notebook/get-shelf-book-id";
import { getShelfBookOutline } from "@/lib/laundromat/notebook/get-shelf-book-outline";
import { getShelfBookPlacements } from "@/lib/laundromat/notebook/get-shelf-book-placements";
import type { CameraFocus } from "@/lib/laundromat/parse-camera-focus";
import { parseCameraFocus } from "@/lib/laundromat/parse-camera-focus";
import { assignRemoteMachines } from "@/lib/laundromat/realtime/assign-remote-machines";
import { chooseCoffeeGroup } from "@/lib/laundromat/realtime/choose-coffee-group";
import { chooseNotebookWriter } from "@/lib/laundromat/realtime/choose-notebook-writer";
import { getClockOffsetMs } from "@/lib/laundromat/realtime/get-clock-offset-ms";
import { getGoldenWashes } from "@/lib/laundromat/realtime/get-golden-washes";
import { getNotebookLock } from "@/lib/laundromat/realtime/get-notebook-lock";
import { getPeopleHere } from "@/lib/laundromat/realtime/get-people-here";
import type {
  DraftContent,
  RemoteEntry,
  RemoteLoad,
} from "@/lib/laundromat/realtime/room-presence";
import { shiftRemoteLoad } from "@/lib/laundromat/realtime/shift-remote-load";
import type { FocusTarget, SceneConfig } from "@/lib/laundromat/scene-config";
import { readTokenLinkText } from "@/lib/laundromat/tip/read-token-link-text";
import type { GoldenWashView } from "@/lib/laundromat/tip/tip-token";
import { TOKEN_CODE_HASH_PREFIX } from "@/lib/laundromat/tip/token-code-format";
import { describeTv } from "@/lib/laundromat/tv/describe-tv";
import type { TvControl } from "@/lib/laundromat/tv/describe-tv-control";
import { describeTvControl } from "@/lib/laundromat/tv/describe-tv-control";
import { getYouTubeWatchUrl } from "@/lib/laundromat/tv/get-youtube-watch-url";
import { getWeatherPanelFace } from "@/lib/laundromat/weather/get-weather-panel-face";
import { isAirPurifierRunning } from "@/lib/laundromat/weather/is-air-purifier-running";
import { cn } from "@/lib/utils";

import { BOARD_DIALOG_SIZE_PX, BoardDialog } from "./board/board-dialog";
import { useLaundromatCopy } from "./i18n/use-laundromat-copy";
import { useLocalWeather } from "./local-weather/use-local-weather";
import { NotebookBook } from "./notebook/notebook-book";
import { ShelfBookButton } from "./notebook/shelf-book-button";
import { useIsNarrowScreen } from "./notebook/use-is-narrow-screen";
import { useNotebookShelf } from "./notebook/use-notebook-shelf";
import type { SceneViews } from "./objects/scene-views";
import type { PlantStreakHandle } from "./plant/plant-streak-layer";
import { PlantStreakLayer } from "./plant/plant-streak-layer";
import { wigglePlant } from "./plant/wiggle-plant";
import { RoomSourceContext } from "./realtime/room-source-context";
import { useRoom } from "./realtime/use-room";
import { useVisitorRegion } from "./realtime/use-visitor-region";
import { useRenderQuality } from "./settings/use-render-quality";
import { useSceneSounds } from "./sound/use-scene-sounds";
import { useSoundBoard } from "./sound/use-sound-board";
import { useSoundMuted } from "./sound/use-sound-muted";
import {
  COIN_PANEL_GUTTER_PX,
  COIN_PANEL_WIDTH_PX,
  COIN_SHEET_ROOM_SHARE,
  CoinMachineSheet,
} from "./tip/coin-machine-sheet";
import { TipJarTray } from "./tip/tip-jar-tray";
import { TokenHint } from "./tip/token-hint";
import { useTip } from "./tip/use-tip";
import { HitTargetButton } from "./hit-target-button";
import { RoomDrawing } from "./room-drawing";
import { SceneControlButton } from "./scene-control-button";
import { SceneTooltip } from "./scene-tooltip";
import { showNotification } from "./show-notification";
import { useLaundry } from "./use-laundry";
import { useRoomAppliances } from "./use-room-appliances";
import { useSceneHour } from "./use-scene-hour";
import { useTickingNow } from "./use-ticking-now";
import { useToyBox } from "./use-toy-box";
import { useTvAudio } from "./use-tv-audio";
import {
  WEATHER_DIALOG_SIZE_PX,
  WeatherPanelDialog,
} from "./weather-panel-dialog";

const TIP_SESSION_PARAM = "tip_session";
const SCENE_UNIT_PX = 40;
const TOOLTIP_DELAY_MS = 300;
const TOUCH_TOOLTIP_HOLD_MS = 1500;
const FOCUS_TARGETS = [
  "shelf",
  "notebook",
  "board",
  "weather",
  "coin",
] satisfies FocusTarget[];
const KNOB_CONTROLS: LaidOutControl["control"][] = ["dial", "tuner", "volume"];
const DOOR_HOLD_OPEN_MS = 700;
const DIALOG_FILL = 0.9;
const DIALOG_MAX_SCALE = 1.15;
const SINGLE_PAGE_GUTTER_PX = 8;

function getFocusedObjectId(options: {
  focus: CameraFocus;
  config: SceneConfig;
}) {
  return options.focus === "room"
    ? undefined
    : options.config.camera.focusTargets[options.focus].objectId;
}

function toCameraTransform(camera: Camera) {
  return `translate(${camera.x}px, ${camera.y}px) scale(${camera.scale})`;
}

function getViewportUncoveredByPanel(options: {
  focus: CameraFocus;
  viewport: Viewport;
  isNarrowScreen: boolean;
}) {
  const { viewport } = options;
  if (options.focus !== "coin") return viewport;
  return options.isNarrowScreen
    ? { width: viewport.width, height: viewport.height * COIN_SHEET_ROOM_SHARE }
    : {
        width: viewport.width - COIN_PANEL_WIDTH_PX - 2 * COIN_PANEL_GUTTER_PX,
        height: viewport.height,
      };
}

function jumpCameraTo(options: { scene: HTMLElement; camera: Camera }) {
  options.scene.style.transition = "none";
  options.scene.style.transform = toCameraTransform(options.camera);
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
  onHeadHome?: (homecoming: Homecoming) => void;
  hidden?: boolean;
  cameraHeld?: boolean;
  onPickUpCamera?: () => void;
};

function toFocusUrl(params: URLSearchParams) {
  const query = params.toString();
  return query === "" ? window.location.pathname : `?${query}`;
}

export function LaundromatScene(props: LaundromatSceneProps) {
  const { config } = props;
  const { reading: weather } = useLocalWeather();
  const isPurifierRunning = isAirPurifierRunning({
    aqi: weather?.aqi,
    minAqi: config.details.airPurifier.minAqi,
  });
  const prefersReducedMotion = useReducedMotion() ?? false;
  const toyBox = useToyBox({
    details: config.details.toyBox,
    reducedMotion: prefersReducedMotion,
  });
  const isToyBoxOpen = toyBox.view.kind === "open";
  const isToyBoxFocusedRef = useRef(false);
  const isCameraHeld = props.cameraHeld === true;
  const layout = useMemo(
    () =>
      buildSceneLayout({
        config: {
          ...config,
          objects: config.objects.filter((object) => {
            switch (object.kind) {
              case "air-purifier":
                return isPurifierRunning;
              case "toy-box":
                return !isToyBoxOpen;
              case "toy-set":
                return isToyBoxOpen;
              case "instant-camera":
                return !isCameraHeld;
              default:
                return true;
            }
          }),
        },
        unit: SCENE_UNIT_PX,
      }),
    [config, isPurifierRunning, isToyBoxOpen, isCameraHeld]
  );
  const searchParams = useSearchParams();
  const focus = parseCameraFocus(searchParams.get("focus"));
  const focusedObjectId = getFocusedObjectId({ focus, config });
  const bookNumber =
    focus === "notebook"
      ? parseBookNumber(searchParams.get("book"))
      : undefined;
  const isHidden = props.hidden === true;
  const isLeavingRef = useRef(false);
  useEffect(() => {
    if (!isHidden) isLeavingRef.current = false;
  }, [isHidden]);
  const { quality } = useRenderQuality();
  const isLite = quality === "lite";
  const isDialogFocus =
    focus === "notebook" ||
    focus === "board" ||
    focus === "weather" ||
    focus === "coin";
  const cameraFocus =
    isLite && isDialogFocus && focus !== "coin" ? "room" : focus;
  const sceneHour = useSceneHour();
  const hour = props.hourOverride ?? sceneHour;

  const rootRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState<Viewport>();
  const [isReady, setIsReady] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string>();
  const [tooltipId, setTooltipId] = useState<string>();
  const [openDoorId, setOpenDoorId] = useState<string>();
  const doorTimerRef = useRef<number>(undefined);
  const tooltipTimerRef = useRef<number>(undefined);
  const touchHoldTimerRef = useRef<number>(undefined);
  const tooltipCooldownTimerRef = useRef<number>(undefined);
  const isTooltipWarmRef = useRef(false);

  const sceneRef = useRef<HTMLDivElement>(null);
  const previousCameraRef = useRef<{ camera: Camera; focus: CameraFocus }>(
    undefined
  );
  const previousFocusRef = useRef(focus);
  const sound = useSoundBoard();
  const tip = useTip();
  const isNarrowScreen = useIsNarrowScreen();
  const [isJarTrayOpen, setIsJarTrayOpen] = useState(false);
  const [tokenRestoreCode, setTokenRestoreCode] = useState<string>();
  const [tipResumeSessionId, setTipResumeSessionId] = useState<string>();
  const isCoinOpenPendingRef = useRef(false);
  const [isCoinBusy, setIsCoinBusy] = useState(false);
  const { copy } = useLaundromatCopy();
  const { muted: isSoundMuted } = useSoundMuted();
  const laundry = useLaundry();
  const appliances = useRoomAppliances({
    config,
    visitorId: laundry.visitorId,
  });
  const plantStreakRef = useRef<PlantStreakHandle>(undefined);
  const [tubeRollCount, setTubeRollCount] = useState(0);
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
                copy,
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
    muted: isSoundMuted || isHidden,
    onSkipStation: () => appliances.dispatchTv({ type: "tune", step: 1 }),
  });

  const [writingSince, setWritingSince] = useState<number>();
  const [coffeeGroupId, setCoffeeGroupId] = useState<string>();
  const ownFlask = appliances.flask;
  const ownLoad = laundry.state.load;
  const roomSource = useContext(RoomSourceContext);
  const { region: ownRegion, isSettled: isOwnRegionSettled } = useVisitorRegion(
    { enabled: roomSource !== undefined }
  );
  const ownGoldenWash = tip?.goldenWashes.at(-1);
  const ownPresence = useMemo(() => {
    if (laundry.visitorId === undefined) return undefined;
    const load = ((): RemoteLoad | undefined => {
      switch (ownLoad.kind) {
        case "carrying":
        case "folded":
          return undefined;
        case "loaded":
        case "done":
          return {
            phase: ownLoad.kind,
            kind: ownLoad.machine.kind,
            machineId: ownLoad.machine.id,
          };
        case "running":
          return {
            phase: "running",
            kind: ownLoad.machine.kind,
            machineId: ownLoad.machine.id,
            startedAt: ownLoad.startedAt,
            durationMs: ownLoad.durationMs,
          };
        default: {
          const unhandled: never = ownLoad;
          return unhandled;
        }
      }
    })();
    const { portions, brewStartedAt, hotUntil, brewedBy, changedAt } = ownFlask;
    const flask =
      changedAt === undefined
        ? undefined
        : {
            portions,
            ...(brewStartedAt === undefined ? {} : { brewStartedAt }),
            ...(hotUntil === undefined ? {} : { hotUntil }),
            ...(brewedBy === undefined ? {} : { brewedBy }),
            changedAt,
          };
    return {
      visitorId: laundry.visitorId,
      ...(ownRegion === undefined ? {} : { region: ownRegion }),
      ...(load === undefined ? {} : { load }),
      ...(coffeeGroupId === undefined ? {} : { coffeeGroupId }),
      ...(flask === undefined ? {} : { flask }),
      ...(writingSince === undefined ? {} : { writingSince }),
      ...(ownGoldenWash === undefined ? {} : { goldenWash: ownGoldenWash }),
    };
  }, [
    laundry.visitorId,
    ownRegion,
    ownLoad,
    coffeeGroupId,
    ownFlask,
    writingSince,
    ownGoldenWash,
  ]);
  const room = useRoom(ownPresence);
  const isRoomSynced = room.isConnected && room.isSynced;
  const coffeeGroupChoice = useMemo(
    () =>
      !isRoomSynced || !isOwnRegionSettled || laundry.visitorId === undefined
        ? undefined
        : chooseCoffeeGroup({
            ownVisitorId: laundry.visitorId,
            ownGroupId: coffeeGroupId,
            ownRegion,
            peers: room.peers,
          }),
    [
      isRoomSynced,
      isOwnRegionSettled,
      laundry.visitorId,
      coffeeGroupId,
      ownRegion,
      room.peers,
    ]
  );
  const { resetFlask } = appliances;
  useEffect(() => {
    if (coffeeGroupChoice === undefined) return;
    switch (coffeeGroupChoice.kind) {
      case "stay":
        return;
      case "merge":
        setCoffeeGroupId(coffeeGroupChoice.groupId);
        return;
      case "join":
        if (coffeeGroupId !== undefined) resetFlask();
        setCoffeeGroupId(coffeeGroupChoice.groupId);
        return;
      case "start":
        if (coffeeGroupId !== undefined) resetFlask();
        setCoffeeGroupId(crypto.randomUUID());
        return;
      default: {
        const unhandled: never = coffeeGroupChoice;
        return unhandled;
      }
    }
  }, [coffeeGroupChoice, coffeeGroupId, resetFlask]);
  const coffeeGroupFlasks = useMemo(
    () =>
      room.peers.flatMap(({ coffeeGroupId: peerGroupId, flask }) =>
        flask === undefined ||
        coffeeGroupId === undefined ||
        peerGroupId !== coffeeGroupId
          ? []
          : [flask]
      ),
    [room.peers, coffeeGroupId]
  );
  const { adoptFlasks } = appliances;
  useEffect(() => {
    adoptFlasks(coffeeGroupFlasks);
  }, [adoptFlasks, coffeeGroupFlasks]);
  const { setClockOffsetsMs } = appliances;
  useEffect(() => {
    setClockOffsetsMs(room.clockOffsetsMs);
  }, [setClockOffsetsMs, room.clockOffsetsMs]);
  const roomNow = useTickingNow({
    active: room.peers.some(
      ({ load, writingSince, goldenWash }) =>
        load !== undefined ||
        writingSince !== undefined ||
        goldenWash !== undefined
    ),
  });
  const now = Math.max(laundry.now, roomNow);
  const goldenWashes = getGoldenWashes({
    own: tip?.goldenWashes ?? [],
    peers: room.peers,
    offsetsMs: room.clockOffsetsMs,
    now,
  });
  const goldenWashMachineIds = goldenWashes.map(({ machineId }) => machineId);
  const peopleHere = getPeopleHere({
    isSynced: room.isConnected && room.isSynced,
    peers: room.peers,
    ownVisitorId: laundry.visitorId,
  });
  const remoteMachines = assignRemoteMachines({
    machines: layout.objects.flatMap(({ object }) =>
      object.kind === "washer" || object.kind === "dryer"
        ? [{ id: object.id, kind: object.kind }]
        : []
    ),
    ownMachineId:
      ownLoad.kind === "carrying" || ownLoad.kind === "folded"
        ? undefined
        : ownLoad.machine.id,
    others: room.peers.flatMap(({ visitorId, region, load }) => {
      if (load === undefined || visitorId === laundry.visitorId) return [];
      const offsetMs =
        getClockOffsetMs({ offsetsMs: room.clockOffsetsMs, visitorId }) ?? 0;
      return [{ visitorId, region, load: shiftRemoteLoad({ load, offsetMs }) }];
    }),
    ownRegion,
    now,
  });
  const notebookWriter = chooseNotebookWriter({
    presences: [
      ...room.peers,
      ...(ownPresence === undefined
        ? []
        : [{ ...ownPresence, sessionId: room.sessionId }]),
    ],
    now,
  });
  const notebookLock = getNotebookLock({
    writerSessionId: notebookWriter,
    ownSessionId: room.sessionId,
    isOwnWriting: writingSince !== undefined,
    room,
  });

  const [wantsFreeNotice, setWantsFreeNotice] = useState(false);
  const [hasUnsavedNote, setHasUnsavedNote] = useState(false);
  const [bookFocusSide, setBookFocusSide] = useState<"left" | "right">();
  const isNotebookTaken = notebookLock.kind === "taken";
  const isNotebookFree = notebookLock.kind === "free";
  const wasNotebookTakenRef = useRef(isNotebookTaken);
  useEffect(() => {
    const wasTaken = wasNotebookTakenRef.current;
    wasNotebookTakenRef.current =
      isNotebookTaken || (wasTaken && !isNotebookFree);
    if (!wasTaken || !isNotebookFree || !wantsFreeNotice || !room.isConnected) {
      return;
    }
    setWantsFreeNotice(false);
    if (!isHidden) sound?.play("notebook-free");
    showNotification({
      title: copy.notebook.freeNotificationTitle,
      body: copy.notebook.freeNotificationBody,
      tag: "laundromat-notebook",
    });
  }, [
    isNotebookTaken,
    isNotebookFree,
    wantsFreeNotice,
    sound,
    isHidden,
    room.isConnected,
    copy,
  ]);

  const { refresh: refreshShelf } = notebookShelf;
  const wasNotebookTakenForShelfRef = useRef(isNotebookTaken);
  useEffect(() => {
    const wasTaken = wasNotebookTakenForShelfRef.current;
    wasNotebookTakenForShelfRef.current = isNotebookTaken;
    if (wasTaken && !isNotebookTaken) void refreshShelf();
  }, [isNotebookTaken, refreshShelf]);
  const handleNotebookPlaced = useCallback(() => {
    void refreshShelf();
  }, [refreshShelf]);

  const handleWritingChange = useCallback((isWriting: boolean) => {
    setWritingSince((current) =>
      isWriting ? (current ?? Date.now()) : undefined
    );
  }, []);

  function handleDraftChange(draft: DraftContent) {
    room.sendDraft(draft);
  }

  function handleEntryPlaced(entry: Omit<RemoteEntry, "sessionId">) {
    room.sendEntry(entry);
  }

  async function handleRequestFreeNotice() {
    setWantsFreeNotice(true);
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
  }

  const machineViews = Object.fromEntries(
    layout.objects.flatMap(({ object }) => {
      if (object.kind !== "washer" && object.kind !== "dryer") return [];
      const machine = {
        id: object.id,
        kind: object.kind,
        number: object.number,
      };
      const remote = remoteMachines[object.id];
      const status = ((): MachineStatus => {
        if (remote === undefined) {
          return getMachineStatus({ state: laundry.state, machine, now });
        }
        if (remote.load.phase !== "running") {
          return { kind: "occupied", phase: remote.load.phase };
        }
        const endsAt = remote.load.startedAt + remote.load.durationMs;
        return endsAt > now
          ? {
              kind: "occupied",
              phase: "running",
              endsAt,
              remainingMs: endsAt - now,
            }
          : { kind: "occupied", phase: "done" };
      })();
      const cycle = getCycleMinutes({
        state: laundry.state,
        machine,
        machines: config.machines,
      });
      const goldenWash = ((): GoldenWashView => {
        if (goldenWashMachineIds.includes(object.id)) return "running";
        if (tip?.heldTokenCode !== undefined) {
          return "invited";
        }
        return "none";
      })();
      const readout = (() => {
        if (goldenWash === "running") return copy.tip.goldenReadout;
        switch (status.kind) {
          case "running":
            return formatRemainingTime(status.remainingMs);
          case "done":
            return copy.readoutDone;
          case "occupied":
            switch (status.phase) {
              case "loaded":
                return `${String(cycle.minutes).padStart(2, "0")}:00`;
              case "running":
                return formatRemainingTime(status.remainingMs);
              case "done":
                return copy.readoutDone;
              default: {
                const unhandled: never = status;
                return unhandled;
              }
            }
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
            dialAngleDeg: getDialAngleDeg({
              detent: cycle.detent,
              detentCount: config.machines.cycleMinutes.length,
            }),
            doorOpen: openDoorId === object.id,
            goldenWash,
          },
        ],
      ];
    })
  );
  type MachineView = (typeof machineViews)[string];
  const basket = getBasketContents(laundry.state.load);
  const homecoming = getHomecoming({ load: laundry.state.load });
  const entranceMat = describeEntranceMat({ homecoming, copy });
  const shelfDescription = describeShelf({
    shelf:
      shelf === undefined
        ? { kind: "loading" }
        : shelf.kind === "online"
          ? { kind: "online", bookCount: shelfBooks.length }
          : { kind: "offline" },
    copy,
  });
  const isShelfFocusBlocked =
    focus === "shelf" && shelf !== undefined && !shelfDescription.ready;
  useEffect(() => {
    if (!isShelfFocusBlocked) return;
    const params = new URLSearchParams(searchParams.toString());
    params.delete("focus");
    params.delete("book");
    window.history.replaceState(null, "", toFocusUrl(params));
  }, [isShelfFocusBlocked, searchParams]);
  const views: SceneViews = {
    machines: machineViews,
    tv: { state: appliances.tv, noSignal: isTvNoSignal },
    coffee: appliances.coffee,
    cup: {
      full: appliances.cup.kind === "full",
      steaming: appliances.isCupSteaming,
    },
    basket,
    shelfBookNumbers: filledBooks.map(({ number }) => number),
    notebookNumber: coverNumber,
    peopleHere,
    tubeRollCount,
    weather,
    toyBox: toyBox.view,
    coinMachine: tip?.machine ?? { kind: "idle" },
    tipJar: {
      coinCount: tip?.jar?.length ?? 0,
    },
    hidden: isHidden,
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
          copy,
        });
      }
      case "tv":
        return describeTvControl({
          control: control.control,
          state: appliances.tv,
          settings: tvSettings,
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

  function describeObject(objectId: string) {
    const view = machineViews[objectId];
    if (view !== undefined) return describeMachine({ ...view, copy });
    const laidOut = layout.objects.find(({ object }) => object.id === objectId);
    if (laidOut === undefined) return undefined;
    switch (laidOut.object.kind) {
      case "tv":
        return describeTv({
          state: appliances.tv,
          settings: tvSettings,
          copy,
        });
      case "coffee-machine":
        return describeCoffeeMachine({ phase: appliances.coffee, copy });
      case "mug":
        return describeCoffeeCup({ cup: appliances.cup, copy });
      case "mat":
        return entranceMat;
      case "basket":
        return describeLaundryBasket({ basket, copy });
      case "shelf":
        return shelfDescription;
      case "tip-jar":
        return tip?.jar === undefined
          ? describeSceneObject({ object: laidOut.object, copy })
          : {
              label: copy.tip.jarLabel({ count: tip.jar.length }),
              tooltip: copy.tip.jarTooltip({ count: tip.jar.length }),
            };
      default:
        return describeSceneObject({
          object: laidOut.object,
          copy,
          peopleHere,
          weather,
        });
    }
  }

  const runningStatuses = Object.values(machineViews).filter(
    ({ status }) =>
      status.kind === "running" ||
      (status.kind === "occupied" && status.phase === "running")
  );
  const isWasherRunning = runningStatuses.some(
    ({ machine }) => machine.kind === "washer"
  );
  const isDryerRunning = runningStatuses.some(
    ({ machine }) => machine.kind === "dryer"
  );
  const isTvHissing =
    appliances.tv.on && (tvAudioState === "buffering" || isTvNoSignal);
  const lampSwitch = useSceneSounds({
    sound,
    isWasherRunning,
    isDryerRunning,
    coffeeKind: appliances.coffee.kind,
    isTvHissing,
    isLampOn:
      hour === undefined ? undefined : getTimeOfDay({ hour, config }).isLampOn,
    loadKind: laundry.state.load.kind,
    peers: isRoomSynced ? room.peers : undefined,
    ownVisitorId: laundry.visitorId,
    isInside: !isHidden,
    focus,
  });

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
    const scene = sceneRef.current;
    if (viewport === undefined || scene === null) return;
    const camera = computeCamera({
      focus: cameraFocus,
      viewport: getViewportUncoveredByPanel({
        focus: cameraFocus,
        viewport,
        isNarrowScreen,
      }),
      layout,
      config,
    });
    const previous = previousCameraRef.current;
    previousCameraRef.current = { camera, focus: cameraFocus };

    const from =
      previous?.camera ??
      computeCamera({ focus: "room", viewport, layout, config });
    if (previous === undefined) {
      jumpCameraTo({ scene, camera: from });
      // A transition started in the same task would otherwise run from the last painted transform.
      void scene.offsetWidth;
      setIsReady(true);
    }
    const isResize = previous?.focus === cameraFocus;
    if (isResize || (previous === undefined && cameraFocus === "room")) {
      jumpCameraTo({ scene, camera });
      return;
    }
    if (prefersReducedMotion) {
      jumpCameraTo({ scene, camera });
      const fade = scene.animate([{ opacity: 0.5 }, { opacity: 1 }], {
        duration: 250,
      });
      return () => fade.cancel();
    }
    const durationMs = getCameraMoveDurationMs({
      from,
      to: camera,
      viewport,
      config,
    });
    scene.style.transition = `transform ${durationMs}ms cubic-bezier(${config.camera.ease.join(",")})`;
    scene.style.transform = toCameraTransform(camera);
    scene.dataset.lmCameraMoving = "";
    function handleTransitionEnd(event: TransitionEvent) {
      if (event.target !== scene || event.propertyName !== "transform") return;
      delete scene?.dataset.lmCameraMoving;
    }
    scene.addEventListener("transitionend", handleTransitionEnd);
    return () => {
      scene.removeEventListener("transitionend", handleTransitionEnd);
      delete scene.dataset.lmCameraMoving;
    };
  }, [
    viewport,
    cameraFocus,
    layout,
    config,
    prefersReducedMotion,
    isNarrowScreen,
  ]);

  useEffect(() => {
    const previousFocus = previousFocusRef.current;
    previousFocusRef.current = focus;
    if (previousFocus === focus) return;
    window.clearTimeout(tooltipTimerRef.current);
    window.clearTimeout(touchHoldTimerRef.current);
    setTooltipId(undefined);
    setHighlightedId(undefined);
    const objectId =
      focusedObjectId ?? getFocusedObjectId({ focus: previousFocus, config });
    if (
      focus !== "board" &&
      focus !== "weather" &&
      focus !== "coin" &&
      objectId !== undefined
    ) {
      rootRef.current
        ?.querySelector<HTMLButtonElement>(`[data-hit-target="${objectId}"]`)
        ?.focus({ preventScroll: true });
    }
  }, [focus, focusedObjectId, config]);

  useEffect(
    () => () => {
      window.clearTimeout(tooltipTimerRef.current);
      window.clearTimeout(touchHoldTimerRef.current);
      window.clearTimeout(tooltipCooldownTimerRef.current);
      window.clearTimeout(doorTimerRef.current);
    },
    []
  );

  useEffect(() => {
    if (!isToyBoxOpen || !isToyBoxFocusedRef.current) return;
    isToyBoxFocusedRef.current = false;
    if (
      document.activeElement !== null &&
      document.activeElement !== document.body
    ) {
      return;
    }
    rootRef.current
      ?.querySelector<HTMLButtonElement>('[data-hit-target="toy-set"]')
      ?.focus({ preventScroll: true });
  }, [isToyBoxOpen]);

  function setFocus(next: CameraFocus, book?: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "room") params.delete("focus");
    else params.set("focus", next);
    if (book === undefined) params.delete("book");
    else params.set("book", String(book));
    // The history API updates `useSearchParams` without a server round trip.
    window.history.pushState(null, "", toFocusUrl(params));
  }

  const remoteGoldenWashKey = goldenWashes
    .filter(({ isOwn }) => !isOwn)
    .map(({ machineId, startedAt }) => `${machineId}:${startedAt}`)
    .join(",");
  const seenRemoteGoldenWashKeyRef = useRef<string>(undefined);
  useEffect(() => {
    if (!isRoomSynced) {
      seenRemoteGoldenWashKeyRef.current = undefined;
      return;
    }
    const seen = seenRemoteGoldenWashKeyRef.current;
    seenRemoteGoldenWashKeyRef.current = remoteGoldenWashKey;
    if (seen === undefined) return;
    const seenWashes = seen.split(",");
    const hasNewWash = remoteGoldenWashKey
      .split(",")
      .some((wash) => wash !== "" && !seenWashes.includes(wash));
    if (hasNewWash) sound?.play("tip-chime");
  }, [remoteGoldenWashKey, isRoomSynced, sound]);

  const isHoldingToken = tip?.heldTokenCode !== undefined;
  const holdToken = tip?.holdToken;
  useEffect(() => {
    if (!isHoldingToken || holdToken === undefined) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      holdToken?.(undefined);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isHoldingToken, holdToken]);

  useEffect(() => {
    if (!isHoldingToken || focus === "room" || focus === "coin") return;
    setFocus("room");
  });

  useEffect(() => {
    if (!isCameraHeld) return;
    const isZoomedIn = new URLSearchParams(window.location.search).has("focus");
    if (isZoomedIn) setFocus("room");
  });

  useEffect(() => {
    if (focus === "room") return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      if (isCoinBusy) return;
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
    window.clearTimeout(touchHoldTimerRef.current);
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

  function holdTooltip(objectId: string) {
    window.clearTimeout(touchHoldTimerRef.current);
    touchHoldTimerRef.current = window.setTimeout(
      () => hideTooltip(objectId),
      TOUCH_TOOLTIP_HOLD_MS
    );
  }

  function dropHeldToken(objectId: string) {
    if (tip === undefined) return;
    if (machineViews[objectId] !== undefined) {
      tip.dropToken({ machineId: objectId });
      return;
    }
    tip.holdToken(undefined);
  }

  function handleActivate(objectId: string) {
    if (isCoinBusy && objectId !== focusedObjectId) return;
    if (tip?.heldTokenCode !== undefined) {
      dropHeldToken(objectId);
      return;
    }
    const isMat = layout.objects.some(
      ({ object }) => object.id === objectId && object.kind === "mat"
    );
    if (isMat) {
      if (focus !== "room") setFocus("room");
      if (isLeavingRef.current) return;
      if (!entranceMat.canLeave) {
        sound?.play("door-locked");
        return;
      }
      isLeavingRef.current = true;
      sound?.play("sliding-door");
      laundry.dispatch({ type: "head-home" });
      props.onHeadHome?.(homecoming);
      return;
    }
    const kind = layout.objects.find(({ object }) => object.id === objectId)
      ?.object.kind;
    if (kind === "instant-camera") {
      window.clearTimeout(tooltipTimerRef.current);
      setTooltipId(undefined);
      props.onPickUpCamera?.();
      return;
    }
    if (kind === "toy-box" || kind === "toy-set") {
      if (focus !== "room") {
        setFocus("room");
        return;
      }
      if (kind === "toy-box" && toyBox.view.kind === "closed") {
        isToyBoxFocusedRef.current =
          document.activeElement?.matches('[data-hit-target="toy-box"]') ??
          false;
        sound?.play("toy-box-open");
        window.clearTimeout(tooltipTimerRef.current);
        setTooltipId(undefined);
        toyBox.open();
      }
      if (kind === "toy-set") toyBox.play();
      return;
    }
    if (kind === "tip-jar") {
      if (focus !== "room") setFocus("room");
      window.clearTimeout(tooltipTimerRef.current);
      setTooltipId(undefined);
      setIsJarTrayOpen(true);
      return;
    }
    if (kind === "coin-machine" && tip === undefined) return;
    if (kind === "mug" || kind === "plant" || kind === "tube-display") {
      if (focus !== "room") {
        setFocus("room");
        return;
      }
      if (kind === "tube-display") {
        setTubeRollCount((count) => count + 1);
        return;
      }
      if (kind === "plant") {
        sound?.play("touch-grass");
        if (rootRef.current !== null) {
          wigglePlant({
            root: rootRef.current,
            swayDeg: config.details.plant.swayDeg,
            durationMs: config.details.plant.wiggleMs,
          });
        }
        window.clearTimeout(tooltipTimerRef.current);
        setTooltipId(undefined);
        plantStreakRef.current?.touch();
        return;
      }
      if (appliances.cup.kind === "full") {
        sound?.play("coffee-sip");
        appliances.dispatchCoffee({ type: "drink" });
      }
      return;
    }
    const target = findFocusTarget({ objectId, config });
    if (target === "shelf" && !shelfDescription.ready) {
      if (focus !== "room") setFocus("room");
      return;
    }
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
    if (tip?.heldTokenCode !== undefined) {
      dropHeldToken(options.objectId);
      return;
    }
    if (focus !== "room") {
      setFocus("room");
      return;
    }
    if (KNOB_CONTROLS.includes(control.control)) {
      sound?.play("knob-click");
      window.clearTimeout(tooltipTimerRef.current);
      setTooltipId(control.id);
      setHighlightedId(control.id);
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
        if (control.control === "flask") {
          sound?.play("coffee-pour");
          appliances.dispatchCoffee({ type: "pour" });
          return;
        }
        sound?.play("coffee-switch");
        sound?.play("coffee-beep");
        appliances.dispatchCoffee({ type: "brew" });
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
        if (appliances.tv.on) sound?.play("tv-static");
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
        sound?.play("coffee-switch");
        appliances.dispatchTv({ type: "power" });
        return;
      default: {
        const unhandled: never = options.control;
        return unhandled;
      }
    }
  }

  function swingDoor(objectId: string) {
    window.clearTimeout(doorTimerRef.current);
    sound?.play("door-latch-open");
    setOpenDoorId(objectId);
    doorTimerRef.current = window.setTimeout(() => {
      setOpenDoorId(undefined);
      doorTimerRef.current = window.setTimeout(
        () => sound?.play("door-latch-close"),
        config.details.machine.doorSwingMs * 0.8
      );
    }, config.details.machine.doorSwingMs + DOOR_HOLD_OPEN_MS);
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
        sound?.play("start-button");
        if (view.status.kind === "running") {
          void laundry.remind(view.machine);
          return;
        }
        laundry.start(view.machine);
        return;
      case "door":
        laundry.dispatch({ type: "open-door", machine: view.machine });
        swingDoor(view.machine.id);
        if (view.status.kind === "done" || view.status.kind === "loadable") {
          sound?.play("collect-laundry", { volume: 0.5 });
        }
        return;
      default: {
        const unhandled: never = control;
        return unhandled;
      }
    }
  }

  const wasCoinFocusRef = useRef(false);
  useEffect(() => {
    if (focus === "coin") {
      wasCoinFocusRef.current = true;
      return;
    }
    setIsCoinBusy(false);
    if (!wasCoinFocusRef.current) return;
    wasCoinFocusRef.current = false;
    setTokenRestoreCode(undefined);
    setTipResumeSessionId(undefined);
  }, [focus]);

  const machineKind = tip?.machine.kind;
  const takeToken = tip?.takeToken;
  useEffect(() => {
    if (focus !== "coin" && machineKind === "token-in-tray") takeToken?.();
  }, [focus, machineKind, takeToken]);

  useEffect(() => {
    function openFromTokenLink() {
      const { hash } = window.location;
      if (!hash.startsWith(TOKEN_CODE_HASH_PREFIX)) return;
      const text = readTokenLinkText(hash);
      window.history.replaceState(
        window.history.state,
        "",
        toFocusUrl(new URLSearchParams(window.location.search))
      );
      if (text === "") return;
      setTokenRestoreCode(text);
      isCoinOpenPendingRef.current = true;
    }
    openFromTokenLink();
    window.addEventListener("hashchange", openFromTokenLink);
    return () => window.removeEventListener("hashchange", openFromTokenLink);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get(TIP_SESSION_PARAM);
    if (sessionId === null) return;
    params.delete(TIP_SESSION_PARAM);
    window.history.replaceState(window.history.state, "", toFocusUrl(params));
    setTipResumeSessionId(sessionId);
    isCoinOpenPendingRef.current = true;
  }, []);

  useEffect(() => {
    if (!isCoinOpenPendingRef.current) return;
    isCoinOpenPendingRef.current = false;
    if (focus !== "coin") setFocus("coin");
  });

  const closeJarTray = useCallback(() => setIsJarTrayOpen(false), []);

  function handleBackdropClick(event: React.MouseEvent<HTMLDivElement>) {
    if (
      tip?.heldTokenCode !== undefined &&
      event.target instanceof Element &&
      event.target.closest("[data-hit-target], [data-token-hint]") === null
    ) {
      tip.holdToken(undefined);
      return;
    }
    if (focus === "room") return;
    if (isCoinBusy) return;
    if (focus === "notebook" && hasUnsavedNote) return;
    const isOnHitTarget =
      event.target instanceof Element &&
      event.target.closest(
        "[data-hit-target], [data-notebook], [data-board-dialog], [data-weather-dialog], [data-coin-panel]"
      ) !== null;
    if (!isOnHitTarget) setFocus("room");
  }

  const tooltip = (() => {
    if (tooltipId === undefined || viewport === undefined) return undefined;
    if (isDialogFocus) return undefined;
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
    const to = (() => {
      if (bookFocusSide === undefined) return { x: 0, y: 0, scale, opacity: 1 };
      const pageScale = Math.min(
        (viewport.width - SINGLE_PAGE_GUTTER_PX * 2) / page.width,
        (viewport.height * fill) / bookHeight
      );
      const towardPage = bookFocusSide === "left" ? 1 : -1;
      return {
        x: (towardPage * page.width * pageScale) / 2,
        y: 0,
        scale: pageScale,
        opacity: 1,
      };
    })();
    const notebookObject = layout.objects.find(
      ({ object }) => object.id === notebookObjectId
    );
    if (notebookObject === undefined || prefersReducedMotion || isLite) {
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

  const boardLift = (() => {
    if (viewport === undefined) return undefined;
    const { width: dialogWidth, height: dialogHeight } = BOARD_DIALOG_SIZE_PX;
    const scale = Math.min(
      DIALOG_MAX_SCALE,
      (viewport.width * DIALOG_FILL) / dialogWidth,
      (viewport.height * DIALOG_FILL) / dialogHeight
    );
    const to = { x: 0, y: 0, scale, opacity: 1 };
    const boardObject = layout.objects.find(
      ({ object }) => object.id === config.camera.focusTargets.board.objectId
    );
    if (boardObject === undefined || prefersReducedMotion || isLite) {
      return { from: { ...to, opacity: 0 }, to };
    }
    const camera = computeCamera({ focus: "board", viewport, layout, config });
    const panel = getBoardFrame({
      position: boardObject.object.position,
      size: boardObject.object.size,
      leanDeg: config.details.board.leanDeg,
      projection: layout.projection,
    }).panel.front;
    const xs = panel.map((point) => point.x);
    const ys = panel.map((point) => point.y);
    const centerX =
      ((Math.min(...xs) + Math.max(...xs)) / 2) * camera.scale + camera.x;
    const centerY =
      ((Math.min(...ys) + Math.max(...ys)) / 2) * camera.scale + camera.y;
    return {
      from: {
        x: centerX - viewport.width / 2,
        y: centerY - viewport.height / 2,
        scale:
          ((Math.max(...xs) - Math.min(...xs)) * camera.scale) / dialogWidth,
        opacity: 0,
      },
      to,
    };
  })();

  const weatherLift = (() => {
    if (viewport === undefined) return undefined;
    const panel = layout.objects.find(
      ({ object }) => object.id === config.camera.focusTargets.weather.objectId
    );
    const label = describeObject(
      config.camera.focusTargets.weather.objectId
    )?.label;
    if (panel === undefined || label === undefined) return undefined;
    const { width: dialogWidth, height: dialogHeight } = WEATHER_DIALOG_SIZE_PX;
    const scale = Math.min(
      DIALOG_MAX_SCALE,
      (viewport.width * DIALOG_FILL) / dialogWidth,
      (viewport.height * DIALOG_FILL) / dialogHeight
    );
    const to = { x: 0, y: 0, scale, opacity: 1 };
    const { rects } = getWeatherPanelFace({
      position: panel.object.position,
      size: panel.object.size,
      projection: layout.projection,
    });
    if (prefersReducedMotion || isLite) {
      return { rects, label, from: { ...to, opacity: 0 }, to };
    }
    const camera = computeCamera({
      focus: "weather",
      viewport,
      layout,
      config,
    });
    const { bounds } = panel;
    return {
      rects,
      label,
      from: {
        x:
          (bounds.x + bounds.width / 2) * camera.scale +
          camera.x -
          viewport.width / 2,
        y:
          (bounds.y + bounds.height / 2) * camera.scale +
          camera.y -
          viewport.height / 2,
        scale: (bounds.width * camera.scale) / dialogWidth,
        opacity: 0,
      },
      to,
    };
  })();

  return (
    <div
      ref={rootRef}
      className="relative size-full overflow-hidden"
      data-lm-daylit
      style={getDaylitTokenStyle({ config, hour })}
      onClick={handleBackdropClick}
    >
      <div
        ref={sceneRef}
        className={cn(
          "absolute top-0 left-0 origin-top-left",
          !isReady && "invisible",
          // Each animation or light-glide frame re-rasterizes the whole room; the open book hides it and a camera move cannot keep up.
          "data-[lm-camera-moving]:[&_*]:![animation-play-state:paused] data-[lm-camera-moving]:[&_:not([data-lm-dim])]:![transition:none]",
          cameraFocus === "notebook" &&
            "[&_*]:![animation-play-state:paused] [&_:not([data-lm-dim])]:![transition:none]"
        )}
        style={{ width: layout.size.width, height: layout.size.height }}
      >
        <RoomDrawing
          layout={layout}
          highlightedId={highlightedId}
          focusedObjectId={focusedObjectId}
          hiddenObjectId={focus === "notebook" ? notebookObjectId : undefined}
          dimAmount={config.camera.unfocusedDim}
          views={views}
          hour={hour}
          lampSwitch={lampSwitch}
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
                    onTouchLeave={() => holdTooltip(control.id)}
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
      </div>
      <AnimatePresence>
        {focus === "notebook" && bookLift !== undefined && (
          <motion.div
            key="notebook"
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <motion.div
              className="pointer-events-auto origin-center will-change-transform"
              initial={bookLift.from}
              animate={bookLift.to}
              exit={{ ...bookLift.from, transition: { duration: 0.32 } }}
              transition={{
                duration:
                  prefersReducedMotion || isLite
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
                pageCurl={!isLite}
                onPlaced={handleNotebookPlaced}
                onClose={() => setFocus("room")}
                lock={notebookLock}
                freeNoticeOn={wantsFreeNotice}
                onWritingChange={handleWritingChange}
                onDraftChange={handleDraftChange}
                onUnsavedChange={setHasUnsavedNote}
                remoteEntry={room.lastEntry}
                onEntryPlaced={handleEntryPlaced}
                onRequestFreeNotice={handleRequestFreeNotice}
                onFocusPageChange={setBookFocusSide}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {focus === "board" && boardLift !== undefined && (
          <motion.div
            key="board"
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <motion.div
              className="pointer-events-auto origin-center will-change-transform"
              initial={boardLift.from}
              animate={boardLift.to}
              exit={{ ...boardLift.from, transition: { duration: 0.32 } }}
              transition={{
                duration:
                  prefersReducedMotion || isLite
                    ? 0.2
                    : config.details.notebook.liftMs / 1000,
                ease: config.camera.ease,
              }}
            >
              <BoardDialog
                backlit={
                  hour === undefined
                    ? false
                    : getTimeOfDay({ hour, config }).isLampOn
                }
                details={config.details.board}
                onClose={() => setFocus("room")}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {focus === "weather" && weatherLift !== undefined && (
          <motion.div
            key="weather"
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <motion.div
              className="pointer-events-auto origin-center will-change-transform"
              initial={weatherLift.from}
              animate={weatherLift.to}
              exit={{ ...weatherLift.from, transition: { duration: 0.32 } }}
              transition={{
                duration:
                  prefersReducedMotion || isLite
                    ? 0.2
                    : config.details.notebook.liftMs / 1000,
                ease: config.camera.ease,
              }}
            >
              <WeatherPanelDialog
                rects={weatherLift.rects}
                weather={weather}
                label={weatherLift.label}
                animated={!isLite}
                glyphMotionSeconds={
                  config.details.weatherPanel.glyphMotionSeconds
                }
                onClose={() => setFocus("room")}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {tip !== undefined && (
        <AnimatePresence>
          {focus === "coin" && (
            <CoinMachineSheet
              key="coin"
              tip={tip}
              narrow={isNarrowScreen}
              reducedMotion={prefersReducedMotion}
              restoreCode={tokenRestoreCode}
              resumeSessionId={tipResumeSessionId}
              onClose={() => setFocus("room")}
              onBusyChange={setIsCoinBusy}
            />
          )}
        </AnimatePresence>
      )}
      {tip !== undefined && (
        <TipJarTray tip={tip} open={isJarTrayOpen} onClose={closeJarTray} />
      )}
      {tip !== undefined && (
        <TokenHint
          held={tip.heldTokenCode !== undefined}
          reducedMotion={prefersReducedMotion}
          onCancel={() => tip.holdToken(undefined)}
        />
      )}
      <SceneTooltip text={tooltip?.text} position={tooltip?.position} />
      {!isHidden && (
        <PlantStreakLayer
          handleRef={plantStreakRef}
          layout={layout}
          viewport={viewport}
          focus={focus}
          config={config}
          copy={copy}
          lite={isLite}
          reducedMotion={prefersReducedMotion}
        />
      )}
      <div
        ref={setTvAudioContainer}
        data-audio-state={tvAudioState}
        aria-hidden
        className="pointer-events-none fixed top-full left-full size-[200px] overflow-hidden"
      />
    </div>
  );
}
