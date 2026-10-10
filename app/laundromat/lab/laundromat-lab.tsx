"use client";

import { useEffect, useMemo, useState } from "react";
import type { DialConfig } from "dialkit";
import { DialRoot, useDialKit, useDialKitController } from "dialkit";
import { useRouter } from "next/navigation";

import { LaundromatScene } from "@/app/laundromat/laundromat-scene";
import { getTimeOfDay } from "@/lib/laundromat/get-time-of-day";
import type { SceneConfig } from "@/lib/laundromat/scene-config";
import { sceneConfig } from "@/lib/laundromat/scene-config";
import { toCssVariables } from "@/lib/laundromat/to-css-variables";

import { ObjectWorkbench } from "./object-workbench";
import { SkyPreview } from "./sky-preview";

import "dialkit/styles.css";

const PANEL_OPTIONS = { persist: true, defaultCollapsed: true };
const SNAP_OPTIONS = ["0.05", "0.1", "0.25", "0.5", "1"];
const COPIED_NOTICE_MS = 2000;

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

const { room, camera, light, sky } = sceneConfig;

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
  lampNoonRatio: [light.lampNoonRatio, 0, 1, 0.01],
  daylightPatchStrength: [light.daylightPatchStrength, 0, 1, 0.01],
  lampColor: light.lampColor,
  daylightColor: light.daylightColor,
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

const workbenchDials = {
  object: {
    type: "select",
    options: sceneConfig.objects.map((object) => object.id),
    default: "washer-1",
  },
  framing: { type: "select", options: ["room", "focus"], default: "room" },
  highlight: false,
  pinTooltip: false,
} satisfies DialConfig;

const exportDials = {
  copyConfig: { type: "action", label: "copy config json" },
} satisfies DialConfig;

export default function LaundromatLab() {
  const router = useRouter();
  const [deviceHour, setDeviceHour] = useState(getDeviceHour);
  const [isPlayingDay, setIsPlayingDay] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const tokens = useDialKit("Tokens", sceneConfig.tokens, {
    id: "laundromat-lab-tokens",
    ...PANEL_OPTIONS,
  });
  const lightValues = useDialKit("Light", lightDials, {
    id: "laundromat-lab-light",
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
  const workbench = useDialKit("Workbench", workbenchDials, {
    id: "laundromat-lab-workbench",
    ...PANEL_OPTIONS,
  });
  useDialKit("Export", exportDials, {
    id: "laundromat-lab-export",
    defaultCollapsed: true,
    onAction: handleCopyConfig,
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
      light: lightValues,
      sky: {
        keys: sky.keys.map((key) => ({
          hour: key.hour,
          ...skyValues.keys[formatHour(key.hour)],
        })),
        sunriseHour: skyValues.sunriseHour,
        sunsetHour: skyValues.sunsetHour,
        twilightHours: skyValues.twilightHours,
        sunColor: skyValues.sunColor,
        sunWarmColor: skyValues.sunWarmColor,
        moonColor: skyValues.moonColor,
        starColor: skyValues.starColor,
        timeJumpGlideMs: skyValues.timeJumpGlideMs,
      },
    } satisfies SceneConfig;
  }, [tokens, lightValues, cameraValues, placement, skyValues]);

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

  async function handleCopyConfig() {
    await navigator.clipboard.writeText(JSON.stringify(config, null, 2));
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
      <div className="min-h-0 min-w-0">
        <LaundromatScene
          config={config}
          hourOverride={timeValues.override ? timeValues.hour : undefined}
        />
      </div>
      <DialRoot position="top-right" theme="dark" />
    </div>
  );
}
