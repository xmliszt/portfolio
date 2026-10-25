"use client";

import { useEffect, useMemo, useState } from "react";
import type { DialConfig } from "dialkit";
import { DialRoot, useDialKit, useDialKitController } from "dialkit";
import { useRouter } from "next/navigation";

import { LaundromatEntry } from "@/app/laundromat/laundromat-entry";
import { LaundromatScene } from "@/app/laundromat/laundromat-scene";
import { LocalWeatherProvider } from "@/app/laundromat/local-weather/local-weather-provider";
import { createFakeRoomSource } from "@/app/laundromat/realtime/create-fake-room-source";
import { RoomSourceContext } from "@/app/laundromat/realtime/room-source-context";
import { SoundBoardProvider } from "@/app/laundromat/sound/sound-board-provider";
import { SceneThemeContext } from "@/app/laundromat/themes/scene-theme-context";
import { SceneThemeStyle } from "@/app/laundromat/themes/scene-theme-style";
import { useThemeSchedules } from "@/app/laundromat/themes/use-theme-schedules";
import { ChargeCheckContext } from "@/app/laundromat/tip/charge-check-context";
import type { BedroomConfig } from "@/lib/laundromat/first-visit/bedroom-config";
import { bedroomConfig } from "@/lib/laundromat/first-visit/bedroom-config";
import { getTimeOfDay } from "@/lib/laundromat/get-time-of-day";
import { en } from "@/lib/laundromat/i18n/copy/en";
import { detectScript } from "@/lib/laundromat/notebook/detect-script";
import type { RoomPresence } from "@/lib/laundromat/realtime/room-presence";
import type { SceneConfig } from "@/lib/laundromat/scene-config";
import { sceneConfig } from "@/lib/laundromat/scene-config";
import { applySceneTheme } from "@/lib/laundromat/themes/apply-scene-theme";
import { parseThemeId } from "@/lib/laundromat/themes/parse-theme-id";
import { resolveThemeSchedule } from "@/lib/laundromat/themes/resolve-theme-schedule";
import type { ThemeId } from "@/lib/laundromat/themes/themes";
import { themes } from "@/lib/laundromat/themes/themes";
import { GOLDEN_CHARGE_MS } from "@/lib/laundromat/tip/golden-charge-ms";
import type { WeatherReading } from "@/lib/laundromat/weather/weather-reading";
import { WEATHER_CONDITIONS } from "@/lib/laundromat/weather/weather-reading";

import { formatHour } from "./format-hour";
import { getThemeLabDials } from "./get-theme-lab-dials";
import { ObjectWorkbench } from "./object-workbench";
import { SkyPreview } from "./sky-preview";
import {
  WORKBENCH_BASKETS,
  WORKBENCH_MACHINE_STATES,
} from "./workbench-options";

const PANEL_OPTIONS = { persist: true, defaultCollapsed: true };
const COPIED_NOTICE_MS = 2000;
const FAKE_NOTEBOOKS_COOKIE = "laundromat_fake_notebooks";

function getDeviceHour() {
  const now = new Date();
  return now.getHours() + now.getMinutes() / 60;
}

function snapTo(options: { value: number; step: number }) {
  return Number(
    (Math.round(options.value / options.step) * options.step).toFixed(3)
  );
}

function toWorkbenchMachineState(value: string) {
  return (
    WORKBENCH_MACHINE_STATES.find((state) => state === value) ?? "loadable"
  );
}

function toWorkbenchBasket(value: string) {
  return WORKBENCH_BASKETS.find((basket) => basket === value) ?? "empty";
}

const realtimeDials = {
  othersWashing: [0, 0, 5, 1],
  othersDrying: [0, 0, 5, 1],
  someoneWriting: false,
  someoneGoldenCharge: false,
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
  goldenChargeStartedAt: number | undefined;
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
  const writers: RoomPresence[] = options.someoneWriting
    ? [
        {
          sessionId: FAKE_WRITER_ID,
          visitorId: FAKE_WRITER_ID,
          writingSince: options.now - 60_000,
        },
      ]
    : [];
  const goldenChargers: RoomPresence[] =
    options.goldenChargeStartedAt === undefined
      ? []
      : [
          {
            sessionId: FAKE_GOLDEN_CHARGER_ID,
            visitorId: FAKE_GOLDEN_CHARGER_ID,
            goldenCharges: [
              {
                machineId: FAKE_GOLDEN_SPEND.machineId,
                attempt: FAKE_GOLDEN_SPEND.attempt,
                startedAt: options.goldenChargeStartedAt,
              },
            ],
          },
        ];
  return [...peers, ...writers, ...goldenChargers];
}

const FAKE_WRITER_ID = "fake-writer";
const FAKE_GOLDEN_CHARGER_ID = "fake-golden-charger";
const FAKE_GOLDEN_SPEND = {
  attempt: "00000000-0000-4000-8000-00000000901d",
  machineId: "washer-3",
};

async function checkFakeCharges(attempts: string[]) {
  return attempts.includes(FAKE_GOLDEN_SPEND.attempt)
    ? [{ ...FAKE_GOLDEN_SPEND, remainingMs: GOLDEN_CHARGE_MS.max }]
    : [];
}

const exportDials = {
  copyConfig: { type: "action", label: "copy config json" },
  copyHamperRoom: { type: "action", label: "copy hamper room json" },
  copyTheme: { type: "action", label: "copy theme json" },
  resetTheme: { type: "action", label: "reset theme controls" },
} satisfies DialConfig;

export default function LaundromatLab() {
  const snapshot = useThemeSchedules();
  const selection = useDialKit(
    "Theme",
    {
      theme: {
        type: "select",
        options: [
          { value: "automatic", label: "Seasonal" },
          ...Object.entries(en.themes.names).map(([value, label]) => ({
            value,
            label,
          })),
        ],
        default: "classic",
      },
      simulateDate: false,
      date: { type: "text", default: "2026-10-31T12:00:00Z" },
    },
    { id: "laundromat-lab-theme", ...PANEL_OPTIONS }
  );
  const dateMs = Date.parse(selection.date);
  const validDate = Number.isFinite(dateMs);
  const scheduled = resolveThemeSchedule({
    schedules: snapshot.schedules,
    nowMs: selection.simulateDate && validDate ? dateMs : snapshot.nowMs,
    availableThemeIds: Object.keys(themes),
  });
  const themeId =
    parseThemeId(
      selection.theme === "automatic" ? scheduled.themeId : selection.theme
    ) ?? "classic";
  return (
    <ThemeWorkbench
      key={themeId}
      themeId={themeId}
      invalidDate={selection.simulateDate && !validDate}
    />
  );
}

type ThemeWorkbenchProps = {
  themeId: ThemeId;
  invalidDate: boolean;
};

function ThemeWorkbench(props: ThemeWorkbenchProps) {
  const base = useMemo(
    () =>
      applySceneTheme({
        scene: sceneConfig,
        bedroom: bedroomConfig,
        theme: themes[props.themeId],
      }),
    [props.themeId]
  );
  const { scene: themedScene, bedroom: themedBedroom } = base;
  const { details, light, sky } = themedScene;
  const {
    placementDials,
    cameraDials,
    lightDials,
    timeDials,
    weatherDials,
    skyDials,
    objectDials,
    workbenchDials,
    hamperRoomDials,
    viewDials,
  } = useMemo(
    () => getThemeLabDials({ scene: themedScene, bedroom: themedBedroom }),
    [themedScene, themedBedroom]
  );
  const router = useRouter();
  const [deviceHour, setDeviceHour] = useState(getDeviceHour);
  const [isPlayingDay, setIsPlayingDay] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [replayCount, setReplayCount] = useState(0);

  const tokensControl = useDialKitController("Tokens", themedScene.tokens, {
    id: `laundromat-lab-${props.themeId}-tokens`,
    ...PANEL_OPTIONS,
  });
  const tokens = tokensControl.values;
  const lightValuesControl = useDialKitController("Light", lightDials, {
    id: `laundromat-lab-${props.themeId}-light`,
    ...PANEL_OPTIONS,
  });
  const lightValues = lightValuesControl.values;
  const dayTokensControl = useDialKitController("Day tokens", light.dayTokens, {
    id: `laundromat-lab-${props.themeId}-day-tokens`,
    ...PANEL_OPTIONS,
  });
  const dayTokens = dayTokensControl.values;
  const cameraValuesControl = useDialKitController("Camera", cameraDials, {
    id: `laundromat-lab-${props.themeId}-camera`,
    ...PANEL_OPTIONS,
    onAction: handleCameraAction,
  });
  const cameraValues = cameraValuesControl.values;
  const placementControl = useDialKitController("Placement", placementDials, {
    id: `laundromat-lab-${props.themeId}-placement`,
    ...PANEL_OPTIONS,
  });
  const placement = placementControl.values;
  const time = useDialKitController("Time of day", timeDials, {
    id: "laundromat-lab-time",
    ...PANEL_OPTIONS,
    onAction: () => setIsPlayingDay((isPlaying) => !isPlaying),
  });
  const skyValuesControl = useDialKitController("Sky", skyDials, {
    id: `laundromat-lab-${props.themeId}-sky`,
    ...PANEL_OPTIONS,
  });
  const skyValues = skyValuesControl.values;
  const objectValuesControl = useDialKitController("Objects", objectDials, {
    id: `laundromat-lab-${props.themeId}-objects`,
    ...PANEL_OPTIONS,
  });
  const objectValues = objectValuesControl.values;
  const weatherValues = useDialKit("Weather", weatherDials, {
    id: "laundromat-lab-weather",
    ...PANEL_OPTIONS,
  });
  const weatherCondition = WEATHER_CONDITIONS.find(
    (condition) => condition === weatherValues.condition
  );
  const { night, temperatureC, city, aqi } = weatherValues;
  const labWeather = useMemo((): WeatherReading | undefined => {
    if (weatherCondition === undefined) return undefined;
    return {
      condition: weatherCondition,
      isDay: !night,
      temperatureC,
      highC: temperatureC + 4,
      lowC: temperatureC - 5,
      city: city || undefined,
      unit: "celsius",
      aqi,
    };
  }, [weatherCondition, night, temperatureC, city, aqi]);
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
  const {
    othersWashing,
    othersDrying,
    someoneWriting,
    someoneGoldenCharge,
    writerDraft,
  } = realtime;
  const [goldenChargeStartedAt, setGoldenChargeStartedAt] = useState<number>();
  useEffect(() => {
    if (!someoneGoldenCharge) {
      setGoldenChargeStartedAt(undefined);
      return;
    }
    setGoldenChargeStartedAt(Date.now());
    const timer = window.setInterval(
      () => setGoldenChargeStartedAt(Date.now()),
      GOLDEN_CHARGE_MS.max
    );
    return () => window.clearInterval(timer);
  }, [someoneGoldenCharge]);
  useEffect(() => {
    fakeRoom.setPeers(
      buildFakePeers({
        othersWashing,
        othersDrying,
        someoneWriting,
        goldenChargeStartedAt,
        now: Date.now(),
      })
    );
  }, [
    fakeRoom,
    othersWashing,
    othersDrying,
    someoneWriting,
    goldenChargeStartedAt,
  ]);
  useEffect(() => {
    if (!someoneWriting) return;
    fakeRoom.setDraft({
      sessionId: FAKE_WRITER_ID,
      kind: "text",
      text: writerDraft,
      script: detectScript(writerDraft),
    });
  }, [fakeRoom, someoneWriting, writerDraft]);
  const hamperRoomControl = useDialKitController(
    "Hamper room",
    hamperRoomDials,
    {
      id: `laundromat-lab-${props.themeId}-hamper-room`,
      ...PANEL_OPTIONS,
    }
  );
  const hamperRoom = hamperRoomControl.values;
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
      ...themedScene,
      tokens,
      objects: themedScene.objects.map((object) => {
        const position = placement.objects[object.id];
        return {
          ...object,
          ...(object.kind === "pumpkin"
            ? { facingDeg: objectValues.pumpkinDirections[object.id] }
            : {}),
          position: {
            x: snapTo({ value: position.x, step }),
            y: snapTo({ value: position.y, step }),
            z: snapTo({ value: position.z, step }),
          },
        };
      }),
      camera: {
        ...themedScene.camera,
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
        ghost: objectValues.ghost,
        skeleton: objectValues.skeleton,
        pumpkin: objectValues.pumpkin,
        cobweb: objectValues.cobweb,
        machine: objectValues.machine,
        tv: { ...details.tv, ...objectValues.tv },
        coffee: objectValues.coffee,
        clock: objectValues.clock,
        plant: objectValues.plant,
        shelf: objectValues.shelf,
        window: objectValues.window,
        board: objectValues.board,
        tubeDisplay: objectValues.tubeDisplay,
        weatherPanel: objectValues.weatherPanel,
        airPurifier: objectValues.airPurifier,
        toyBox: objectValues.toyBox,
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
    themedScene,
    details,
    sky,
  ]);

  const bedroom = useMemo(() => {
    const { _collapsed, ...layout } = hamperRoom.layout;
    const { _collapsed: _motionCollapsed, ...motionValues } = hamperRoom.motion;
    return {
      ...themedBedroom,
      ...layout,
      decorations: themedBedroom.decorations.map((object) => ({
        ...object,
        ...(object.kind === "pumpkin"
          ? { facingDeg: objectValues.pumpkinDirections[object.id] }
          : {}),
        position: hamperRoom.decorations[object.id].position,
        size: hamperRoom.decorations[object.id].size,
      })),
      garments: themedBedroom.garments.map((garment) => {
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
  }, [hamperRoom, themedBedroom, objectValues.pumpkinDirections]);

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
    if (action === "resetTheme") {
      [
        tokensControl,
        lightValuesControl,
        dayTokensControl,
        cameraValuesControl,
        placementControl,
        skyValuesControl,
        objectValuesControl,
        hamperRoomControl,
      ].forEach((control) => control.resetValues());
      return;
    }
    const value = (() => {
      if (action === "copyHamperRoom") return bedroom;
      if (action === "copyTheme")
        return {
          ...themes[props.themeId],
          tokens,
          dayTokens,
          light: lightValues,
          details: config.details,
          objects: config.objects.filter(
            (object) =>
              !sceneConfig.objects.some(
                (baseObject) => baseObject.id === object.id
              )
          ),
          bedroom,
        };
      return config;
    })();
    await navigator.clipboard.writeText(JSON.stringify(value, null, 2));
    setIsCopied(true);
  }

  const hour = timeValues.override ? timeValues.hour : deviceHour;
  const timeOfDay = getTimeOfDay({ hour, config });
  const workbenchObject =
    config.objects.find((object) => object.id === workbench.object) ??
    config.objects[0];

  return (
    <SceneThemeContext.Provider
      value={{ kind: "preview", themeId: props.themeId, tokens: config.tokens }}
    >
      <LocalWeatherProvider reading={labWeather}>
        <div
          data-laundromat-lab
          className="grid size-full grid-cols-[360px_1fr]"
        >
          <SceneThemeStyle config={config} themeId={props.themeId} />
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
                    workbench.framing === "focus"
                      ? config.camera.maxFocusZoom
                      : 1
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
              {props.invalidDate
                ? "enter a valid simulation date"
                : isCopied
                  ? "config copied"
                  : `theme: ${en.themes.names[props.themeId]}`}
            </p>
          </div>
          <SoundBoardProvider>
            <RoomSourceContext.Provider value={fakeRoom.source}>
              <ChargeCheckContext.Provider value={checkFakeCharges}>
                <div className="min-h-0 min-w-0">
                  {view.room === "hamper room" ? (
                    <LaundromatEntry
                      key={`${replayCount}-${sceneKey}`}
                      config={config}
                      bedroom={bedroom}
                      hourOverride={
                        timeValues.override ? timeValues.hour : undefined
                      }
                      ignoreArrivedFlag
                    />
                  ) : (
                    <LaundromatScene
                      key={sceneKey}
                      config={config}
                      hourOverride={
                        timeValues.override ? timeValues.hour : undefined
                      }
                    />
                  )}
                </div>
              </ChargeCheckContext.Provider>
            </RoomSourceContext.Provider>
          </SoundBoardProvider>
          <DialRoot
            position="top-right"
            theme={themes[props.themeId].colorScheme}
          />
        </div>
      </LocalWeatherProvider>
    </SceneThemeContext.Provider>
  );
}
