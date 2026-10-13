"use client";

import { useEffect, useMemo, useState } from "react";
import type { DialConfig } from "dialkit";
import { DialRoot, useDialKit, useDialKitController } from "dialkit";
import { useRouter } from "next/navigation";

import { LaundromatEntry } from "@/app/laundromat/laundromat-entry";
import { LaundromatScene } from "@/app/laundromat/laundromat-scene";
import { createFakeRoomSource } from "@/app/laundromat/realtime/create-fake-room-source";
import { RoomSourceContext } from "@/app/laundromat/realtime/room-source-context";
import { SoundBoardProvider } from "@/app/laundromat/sound/sound-board-provider";
import type { BedroomConfig } from "@/lib/laundromat/first-visit/bedroom-config";
import { bedroomConfig } from "@/lib/laundromat/first-visit/bedroom-config";
import { getTimeOfDay } from "@/lib/laundromat/get-time-of-day";
import type { BasketContents } from "@/lib/laundromat/laundry/get-basket-contents";
import { detectScript } from "@/lib/laundromat/notebook/detect-script";
import type { RoomPresence } from "@/lib/laundromat/realtime/room-presence";
import type { SceneConfig } from "@/lib/laundromat/scene-config";
import { sceneConfig } from "@/lib/laundromat/scene-config";
import { toCssVariables } from "@/lib/laundromat/to-css-variables";

import type { WorkbenchMachineState } from "./object-workbench";
import { ObjectWorkbench } from "./object-workbench";
import { SkyPreview } from "./sky-preview";

import "dialkit/styles.css";

const PANEL_OPTIONS = { persist: true, defaultCollapsed: true };
const SNAP_OPTIONS = ["0.05", "0.1", "0.25", "0.5", "1"];
const COPIED_NOTICE_MS = 2000;
const FAKE_NOTEBOOKS_COOKIE = "laundromat_fake_notebooks";
const VIEWS = ["laundromat", "hamper room"];

function formatHour(hour: number) {
  const minutes = Math.round(hour * 60) % (24 * 60);
  const hh = String(Math.floor(minutes / 60)).padStart(2, "0");
  const mm = String(minutes % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

function getDeviceHour() {
  const now = new Date();
  return now.getHours() + now.getMinutes() / 60;
}

function snapTo(options: { value: number; step: number }) {
  return Number(
    (Math.round(options.value / options.step) * options.step).toFixed(3)
  );
}

function isoSlider(options: { value: number; max: number }) {
  return [options.value, 0, options.max, 0.05] satisfies [
    number,
    number,
    number,
    number,
  ];
}

function toWorkbenchMachineState(value: string) {
  return (
    WORKBENCH_MACHINE_STATES.find((state) => state === value) ?? "loadable"
  );
}

function toWorkbenchBasket(value: string) {
  return WORKBENCH_BASKETS.find((basket) => basket === value) ?? "empty";
}

const { room, camera, light, sky, details } = sceneConfig;

const placementDials = {
  snap: { type: "select", options: SNAP_OPTIONS, default: "0.1" },
  objects: Object.fromEntries(
    sceneConfig.objects.map((object) => [
      object.id,
      {
        x: isoSlider({ value: object.position.x, max: room.width }),
        y: isoSlider({ value: object.position.y, max: room.depth }),
        z: isoSlider({ value: object.position.z, max: room.wallHeight }),
        _collapsed: true,
      },
    ])
  ),
} satisfies DialConfig;

const cameraDials = {
  nearDurationMs: [camera.nearDurationMs, 100, 2000, 10],
  farDurationMs: [camera.farDurationMs, 100, 2000, 10],
  focusPaddingRatio: [camera.focusPaddingRatio, 0, 0.45, 0.01],
  roomPaddingRatio: [camera.roomPaddingRatio, 0, 0.3, 0.01],
  maxFocusZoom: [camera.maxFocusZoom, 1, 8, 0.1],
  unfocusedDim: [camera.unfocusedDim, 0, 1, 0.01],
  ease: {
    x1: [camera.ease[0], 0, 1, 0.01],
    y1: [camera.ease[1], -1, 2, 0.01],
    x2: [camera.ease[2], 0, 1, 0.01],
    y2: [camera.ease[3], -1, 2, 0.01],
  },
  focusShelf: { type: "action", label: "focus shelf" },
  focusNotebook: { type: "action", label: "focus notebook" },
  focusRoom: { type: "action", label: "back to room" },
} satisfies DialConfig;

const lightDials = {
  poolIntensity: [light.poolIntensity, 0, 2, 0.01],
  lampOnDaylight: [light.lampOnDaylight, 0, 1, 0.01],
  daylightPatchStrength: [light.daylightPatchStrength, 0, 1, 0.01],
  lampColor: light.lampColor,
  daylightColor: light.daylightColor,
  daylightFillOpacity: [light.daylightFillOpacity, 0, 0.3, 0.005],
} satisfies DialConfig;

const timeDials = {
  override: false,
  hour: [12, 0, 24, 0.05],
  lapseSeconds: [30, 5, 120, 1],
  playDay: { type: "action", label: "play a day" },
} satisfies DialConfig;

const skyDials = {
  sunriseHour: [sky.sunriseHour, 3, 9, 0.05],
  sunsetHour: [sky.sunsetHour, 16, 22, 0.05],
  twilightHours: [sky.twilightHours, 0.25, 4, 0.05],
  goldenHourElevation: [sky.goldenHourElevation, 0.05, 1, 0.01],
  sunColor: sky.sunColor,
  sunWarmColor: sky.sunWarmColor,
  moonColor: sky.moonColor,
  starColor: sky.starColor,
  timeJumpGlideMs: [sky.timeJumpGlideMs, 0, 5000, 50],
  keys: Object.fromEntries(
    sky.keys.map((key) => [
      formatHour(key.hour),
      { top: key.top, horizon: key.horizon },
    ])
  ),
} satisfies DialConfig;

const objectDials = {
  machine: {
    doorOpenDeg: [details.machine.doorOpenDeg, 0, 160, 1],
    doorSwingMs: [details.machine.doorSwingMs, 0, 1200, 10],
    drumSecondsPerTurn: [details.machine.drumSecondsPerTurn, 0.5, 8, 0.1],
    tumbleOpacity: [details.machine.tumbleOpacity, 0, 1, 0.01],
    displayGlow: [details.machine.displayGlow, 0, 1, 0.01],
    dryerGlow: [details.machine.dryerGlow, 0, 1, 0.01],
    dialSettleMs: [details.machine.dialSettleMs, 0, 600, 10],
    _collapsed: true,
  },
  tv: {
    defaultVolumePercent: [details.tv.defaultVolumePercent, 0, 100, 1],
    volumeStepPercent: [details.tv.volumeStepPercent, 1, 50, 1],
    powerMs: [details.tv.powerMs, 0, 1200, 10],
    screenGlow: [details.tv.screenGlow, 0, 1, 0.01],
    reflection: [details.tv.reflection, 0, 0.5, 0.01],
    stallSeconds: [details.tv.stallSeconds, 2, 60, 1],
    noSignalMs: [details.tv.noSignalMs, 0, 5000, 50],
    osdSeconds: [details.tv.osdSeconds, 0.5, 6, 0.1],
    staticMs: [details.tv.staticMs, 0, 600, 10],
    thumbnailDim: [details.tv.thumbnailDim, 0, 0.8, 0.01],
    scanlineOpacity: [details.tv.scanlineOpacity, 0, 1, 0.01],
    scanlineDriftSeconds: [details.tv.scanlineDriftSeconds, 0.5, 20, 0.5],
    vignette: [details.tv.vignette, 0, 1, 0.01],
    flicker: [details.tv.flicker, 0, 0.3, 0.01],
    _collapsed: true,
  },
  coffee: {
    flaskPortions: [details.coffee.flaskPortions, 1, 8, 1],
    brewSeconds: [details.coffee.brewSeconds, 2, 180, 1],
    hotMinutes: [details.coffee.hotMinutes, 0.1, 30, 0.1],
    streamFlowMs: [details.coffee.streamFlowMs, 60, 2000, 10],
    steamOpacity: [details.coffee.steamOpacity, 0, 1, 0.01],
    steamRiseSeconds: [details.coffee.steamRiseSeconds, 0.5, 8, 0.1],
    _collapsed: true,
  },
  clock: {
    hourHandWidth: [details.clock.hourHandWidth, 0.5, 4, 0.05],
    minuteHandWidth: [details.clock.minuteHandWidth, 0.5, 4, 0.05],
    glassHighlight: [details.clock.glassHighlight, 0, 0.5, 0.01],
    _collapsed: true,
  },
  plant: {
    swayDeg: [details.plant.swayDeg, 0, 6, 0.05],
    swayMinSeconds: [details.plant.swayMinSeconds, 1, 20, 0.5],
    swayMaxSeconds: [details.plant.swayMaxSeconds, 1, 30, 0.5],
    wiggleMs: [details.plant.wiggleMs, 200, 3000, 50],
    _collapsed: true,
  },
  shelf: {
    bookLean: [details.shelf.bookLean, 0, 0.4, 0.01],
    spineGlow: [details.shelf.spineGlow, 0, 1, 0.01],
    bookLift: [details.shelf.bookLift, 0, 0.5, 0.01],
    _collapsed: true,
  },
  window: {
    litWindowOpacity: [details.window.litWindowOpacity, 0, 1, 0.01],
    _collapsed: true,
  },
  board: {
    leanDeg: [details.board.leanDeg, 0, 20, 0.5],
    dayShade: [details.board.dayShade, 0, 0.8, 0.01],
    frontlight: [details.board.frontlight, 0, 0.5, 0.01],
    floorSpill: [details.board.floorSpill, 0, 0.6, 0.01],
    visibleUpdates: [details.board.visibleUpdates, 1, 3, 1],
    _collapsed: true,
  },
  tubeDisplay: {
    digitGlow: [details.tubeDisplay.digitGlow, 0, 1, 0.01],
    ghostOpacity: [details.tubeDisplay.ghostOpacity, 0, 0.5, 0.01],
    rollMs: [details.tubeDisplay.rollMs, 0, 3000, 50],
    _collapsed: true,
  },
  notebook: {
    coverNumber: [details.notebook.coverNumber, 1, 99, 1],
    liftMs: [details.notebook.liftMs, 0, 1600, 10],
    coverOpenMs: [details.notebook.coverOpenMs, 0, 2000, 10],
    openWaitMaxMs: [
      details.notebook.openWaitMaxMs,
      details.notebook.liftMs,
      6000,
      50,
    ],
    coverCrackDeg: [details.notebook.coverCrackDeg, 0, 30, 1],
    coverBreathDeg: [details.notebook.coverBreathDeg, 0, 15, 0.5],
    coverBreathMs: [details.notebook.coverBreathMs, 200, 4000, 50],
    riffleSheets: [details.notebook.riffleSheets, 1, 8, 1],
    riffleStaggerMs: [details.notebook.riffleStaggerMs, 0, 300, 5],
    riffleSheetMs: [details.notebook.riffleSheetMs, 100, 1500, 10],
    turnMs: [details.notebook.turnMs, 100, 2000, 10],
    curlStrength: [details.notebook.curlStrength, 0, 1, 0.01],
    inkSpeed: [details.notebook.inkSpeed, 0.25, 8, 0.05],
    _collapsed: true,
  },
} satisfies DialConfig;

const WORKBENCH_MACHINE_STATES = [
  "loadable",
  "loaded",
  "running",
  "done",
] satisfies WorkbenchMachineState[];
const WORKBENCH_BASKETS = [
  "empty",
  "dirty",
  "wet",
  "folded",
] satisfies BasketContents[];

const workbenchDials = {
  object: {
    type: "select",
    options: sceneConfig.objects.map((object) => object.id),
    default: "washer-1",
  },
  framing: { type: "select", options: ["room", "focus"], default: "room" },
  highlight: false,
  pinTooltip: false,
  machine: {
    type: "select",
    options: WORKBENCH_MACHINE_STATES,
    default: "loadable",
  },
  doorOpen: false,
  basket: { type: "select", options: WORKBENCH_BASKETS, default: "dirty" },
} satisfies DialConfig;

const { garments, stage: _stage, motion, ...bedroomLayout } = bedroomConfig;

const hamperRoomDials = {
  layout: { ...bedroomLayout, _collapsed: true },
  garments: Object.fromEntries(
    garments.map((garment) => [
      garment.kind,
      {
        x: garment.at.x,
        y: garment.at.y,
        rotateDeg: garment.rotateDeg,
        scaleX: garment.scale.x,
        scaleY: garment.scale.y,
        _collapsed: true,
      },
    ])
  ),
  motion: { ...motion, _collapsed: true },
} satisfies DialConfig;

const viewDials = {
  room: { type: "select", options: VIEWS, default: "laundromat" },
  replay: { type: "action", label: "replay hamper room" },
  fakeNotebooks: false,
} satisfies DialConfig;

const realtimeDials = {
  othersWashing: [0, 0, 5, 1],
  othersDrying: [0, 0, 5, 1],
  someoneWriting: false,
  writerDraft: {
    type: "text",
    default: "the dryer on the end is my favourite",
  },
} satisfies DialConfig;

const FAKE_CYCLE_MS = 25 * 60_000;
const FAKE_START_GAP_MS = 4 * 60_000;

function buildFakePeers(options: {
  othersWashing: number;
  othersDrying: number;
  someoneWriting: boolean;
  now: number;
}) {
  const loads = [
    ...Array.from({ length: options.othersWashing }, () => "washer" as const),
    ...Array.from({ length: options.othersDrying }, () => "dryer" as const),
  ];
  const peers: RoomPresence[] = loads.map((kind, index) => {
    const indexInKind = loads
      .slice(0, index)
      .filter((other) => other === kind).length;
    return {
      sessionId: `fake-${kind}-${indexInKind}`,
      visitorId: `fake-${kind}-${indexInKind}`,
      load: {
        phase: "running",
        kind,
        startedAt: options.now - (indexInKind + 1) * FAKE_START_GAP_MS,
        durationMs: FAKE_CYCLE_MS,
      },
    };
  });
  return options.someoneWriting
    ? [
        ...peers,
        {
          sessionId: FAKE_WRITER_ID,
          visitorId: FAKE_WRITER_ID,
          writingSince: options.now - 60_000,
        },
      ]
    : peers;
}

const FAKE_WRITER_ID = "fake-writer";

const exportDials = {
  copyConfig: { type: "action", label: "copy config json" },
  copyHamperRoom: { type: "action", label: "copy hamper room json" },
} satisfies DialConfig;

export default function LaundromatLab() {
  const router = useRouter();
  const [deviceHour, setDeviceHour] = useState(getDeviceHour);
  const [isPlayingDay, setIsPlayingDay] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [replayCount, setReplayCount] = useState(0);

  const tokens = useDialKit("Tokens", sceneConfig.tokens, {
    id: "laundromat-lab-tokens",
    ...PANEL_OPTIONS,
  });
  const lightValues = useDialKit("Light", lightDials, {
    id: "laundromat-lab-light",
    ...PANEL_OPTIONS,
  });
  const dayTokens = useDialKit("Day tokens", light.dayTokens, {
    id: "laundromat-lab-day-tokens",
    ...PANEL_OPTIONS,
  });
  const cameraValues = useDialKit("Camera", cameraDials, {
    id: "laundromat-lab-camera",
    ...PANEL_OPTIONS,
    onAction: handleCameraAction,
  });
  const placement = useDialKit("Placement", placementDials, {
    id: "laundromat-lab-placement",
    ...PANEL_OPTIONS,
  });
  const time = useDialKitController("Time of day", timeDials, {
    id: "laundromat-lab-time",
    ...PANEL_OPTIONS,
    onAction: () => setIsPlayingDay((isPlaying) => !isPlaying),
  });
  const skyValues = useDialKit("Sky", skyDials, {
    id: "laundromat-lab-sky",
    ...PANEL_OPTIONS,
  });
  const objectValues = useDialKit("Objects", objectDials, {
    id: "laundromat-lab-objects",
    ...PANEL_OPTIONS,
  });
  const workbench = useDialKit("Workbench", workbenchDials, {
    id: "laundromat-lab-workbench",
    ...PANEL_OPTIONS,
  });
  const view = useDialKit("View", viewDials, {
    id: "laundromat-lab-view",
    persist: true,
    onAction: () => setReplayCount((count) => count + 1),
  });
  const realtime = useDialKit("Realtime", realtimeDials, {
    id: "laundromat-lab-realtime",
    ...PANEL_OPTIONS,
  });
  const [fakeRoom] = useState(() => createFakeRoomSource());
  const { othersWashing, othersDrying, someoneWriting, writerDraft } = realtime;
  useEffect(() => {
    fakeRoom.setPeers(
      buildFakePeers({
        othersWashing,
        othersDrying,
        someoneWriting,
        now: Date.now(),
      })
    );
  }, [fakeRoom, othersWashing, othersDrying, someoneWriting]);
  useEffect(() => {
    if (!someoneWriting) return;
    fakeRoom.setDraft({
      sessionId: FAKE_WRITER_ID,
      text: writerDraft,
      script: detectScript(writerDraft),
    });
  }, [fakeRoom, someoneWriting, writerDraft]);
  const hamperRoom = useDialKit("Hamper room", hamperRoomDials, {
    id: "laundromat-lab-hamper-room",
    ...PANEL_OPTIONS,
  });
  useDialKit("Export", exportDials, {
    id: "laundromat-lab-export",
    defaultCollapsed: true,
    onAction: handleCopy,
  });
  const {
    values: timeValues,
    setValue: setTimeValue,
    getValues: getTimeValues,
  } = time;

  const config = useMemo(() => {
    const step = Number(placement.snap);
    const { ease } = cameraValues;
    return {
      ...sceneConfig,
      tokens,
      objects: sceneConfig.objects.map((object) => {
        const position = placement.objects[object.id];
        return {
          ...object,
          position: {
            x: snapTo({ value: position.x, step }),
            y: snapTo({ value: position.y, step }),
            z: snapTo({ value: position.z, step }),
          },
        };
      }),
      camera: {
        ...sceneConfig.camera,
        nearDurationMs: cameraValues.nearDurationMs,
        farDurationMs: cameraValues.farDurationMs,
        focusPaddingRatio: cameraValues.focusPaddingRatio,
        roomPaddingRatio: cameraValues.roomPaddingRatio,
        maxFocusZoom: cameraValues.maxFocusZoom,
        unfocusedDim: cameraValues.unfocusedDim,
        ease: [ease.x1, ease.y1, ease.x2, ease.y2],
      },
      light: { ...lightValues, dayTokens },
      sky: {
        keys: sky.keys.map((key) => ({
          hour: key.hour,
          ...skyValues.keys[formatHour(key.hour)],
        })),
        sunriseHour: skyValues.sunriseHour,
        sunsetHour: skyValues.sunsetHour,
        twilightHours: skyValues.twilightHours,
        goldenHourElevation: skyValues.goldenHourElevation,
        sunColor: skyValues.sunColor,
        sunWarmColor: skyValues.sunWarmColor,
        moonColor: skyValues.moonColor,
        starColor: skyValues.starColor,
        timeJumpGlideMs: skyValues.timeJumpGlideMs,
      },
      details: {
        machine: objectValues.machine,
        tv: { ...objectValues.tv, stations: details.tv.stations },
        coffee: objectValues.coffee,
        clock: objectValues.clock,
        plant: objectValues.plant,
        shelf: objectValues.shelf,
        window: objectValues.window,
        board: objectValues.board,
        tubeDisplay: objectValues.tubeDisplay,
        notebook: {
          ...objectValues.notebook,
          turnEase: details.notebook.turnEase,
        },
      },
    } satisfies SceneConfig;
  }, [
    tokens,
    lightValues,
    dayTokens,
    cameraValues,
    placement,
    skyValues,
    objectValues,
  ]);

  const bedroom = useMemo(() => {
    const { _collapsed, ...layout } = hamperRoom.layout;
    const { _collapsed: _motionCollapsed, ...motionValues } = hamperRoom.motion;
    return {
      ...bedroomConfig,
      ...layout,
      garments: bedroomConfig.garments.map((garment) => {
        const dials = hamperRoom.garments[garment.kind];
        return {
          ...garment,
          at: { x: dials.x, y: dials.y },
          rotateDeg: dials.rotateDeg,
          scale: { x: dials.scaleX, y: dials.scaleY },
        };
      }),
      motion: motionValues,
    } satisfies BedroomConfig;
  }, [hamperRoom]);

  const { fakeNotebooks } = view;
  const [sceneKey, setSceneKey] = useState(0);
  useEffect(() => {
    document.cookie = `${FAKE_NOTEBOOKS_COOKIE}=${fakeNotebooks ? "1" : "0"}; path=/; samesite=lax`;
    setSceneKey((key) => key + 1);
    return () => {
      document.cookie = `${FAKE_NOTEBOOKS_COOKIE}=0; path=/; samesite=lax`;
    };
  }, [fakeNotebooks]);

  useEffect(() => {
    const interval = window.setInterval(
      () => setDeviceHour(getDeviceHour()),
      60_000
    );
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isPlayingDay) return;
    const { hour: startHour, lapseSeconds } = getTimeValues();
    const startedAt = performance.now();
    const durationMs = lapseSeconds * 1000;
    setTimeValue("override", true);
    let frame = requestAnimationFrame(function tick(now) {
      const progress = Math.min(1, (now - startedAt) / durationMs);
      setTimeValue("hour", (startHour + progress * 24) % 24);
      if (progress < 1) frame = requestAnimationFrame(tick);
      else setIsPlayingDay(false);
    });
    return () => cancelAnimationFrame(frame);
  }, [isPlayingDay, setTimeValue, getTimeValues]);

  useEffect(() => {
    if (!isCopied) return;
    const timeout = window.setTimeout(
      () => setIsCopied(false),
      COPIED_NOTICE_MS
    );
    return () => window.clearTimeout(timeout);
  }, [isCopied]);

  function handleCameraAction(action: string) {
    switch (action) {
      case "focusShelf":
        router.push("?focus=shelf", { scroll: false });
        return;
      case "focusNotebook":
        router.push("?focus=notebook", { scroll: false });
        return;
      case "focusRoom":
        router.push(window.location.pathname, { scroll: false });
        return;
    }
  }

  async function handleCopy(action: string) {
    const value = action === "copyHamperRoom" ? bedroom : config;
    await navigator.clipboard.writeText(JSON.stringify(value, null, 2));
    setIsCopied(true);
  }

  const hour = timeValues.override ? timeValues.hour : deviceHour;
  const timeOfDay = getTimeOfDay({ hour, config });
  const workbenchObject =
    config.objects.find((object) => object.id === workbench.object) ??
    config.objects[0];

  return (
    <div data-laundromat-lab className="grid size-full grid-cols-[360px_1fr]">
      <style>{`[data-laundromat-lab] { ${toCssVariables(config.tokens)} }`}</style>
      <div className="flex min-h-0 flex-col gap-y-3 border-r border-[var(--lm-edge)] p-3">
        <section className="flex min-h-0 flex-1 flex-col gap-y-2">
          <h2 className="text-[11px] lowercase">
            workbench · {workbenchObject.id}
          </h2>
          <div className="min-h-0 flex-1 rounded-md border border-[var(--lm-edge)]">
            <ObjectWorkbench
              config={config}
              object={workbenchObject}
              scale={
                workbench.framing === "focus" ? config.camera.maxFocusZoom : 1
              }
              highlighted={workbench.highlight}
              tooltipPinned={workbench.pinTooltip}
              hour={hour}
              machineState={toWorkbenchMachineState(workbench.machine)}
              doorOpen={workbench.doorOpen}
              basket={toWorkbenchBasket(workbench.basket)}
            />
          </div>
        </section>
        <section className="flex h-48 flex-col gap-y-2">
          <h2 className="text-[11px] lowercase">time of day</h2>
          <SkyPreview
            top={timeOfDay.skyTop}
            horizon={timeOfDay.skyHorizon}
            sunProgress={
              (hour - config.sky.sunriseHour) /
              (config.sky.sunsetHour - config.sky.sunriseHour)
            }
            label={`${formatHour(hour)} · ${timeValues.override ? "override" : "device"}`}
          />
        </section>
        <p
          role="status"
          className="h-4 text-[11px] text-[var(--lm-accent-hi)] lowercase"
        >
          {isCopied ? "config copied" : ""}
        </p>
      </div>
      <SoundBoardProvider>
        <RoomSourceContext.Provider value={fakeRoom.source}>
          <div className="min-h-0 min-w-0">
            {view.room === "hamper room" ? (
              <LaundromatEntry
                key={`${replayCount}-${sceneKey}`}
                config={config}
                bedroom={bedroom}
                hourOverride={timeValues.override ? timeValues.hour : undefined}
                ignoreArrivedFlag
              />
            ) : (
              <LaundromatScene
                key={sceneKey}
                config={config}
                hourOverride={timeValues.override ? timeValues.hour : undefined}
              />
            )}
          </div>
        </RoomSourceContext.Provider>
      </SoundBoardProvider>
      <DialRoot position="top-right" theme="dark" />
    </div>
  );
}
