import type { DialConfig } from "dialkit";

import type { BedroomConfig } from "@/lib/laundromat/first-visit/bedroom-config";
import type { SceneConfig } from "@/lib/laundromat/scene-config";
import { WEATHER_CONDITIONS } from "@/lib/laundromat/weather/weather-reading";

import { formatHour } from "./format-hour";
import {
  WORKBENCH_BASKETS,
  WORKBENCH_MACHINE_STATES,
} from "./workbench-options";
const SNAP_OPTIONS = ["0.05", "0.1", "0.25", "0.5", "1"];
const VIEWS = ["laundromat", "hamper room"];

function isoSlider(options: { value: number; max: number }) {
  return [options.value, 0, options.max, 0.05] satisfies [
    number,
    number,
    number,
    number,
  ];
}

export function getThemeLabDials(options: {
  scene: SceneConfig;
  bedroom: BedroomConfig;
}) {
  const sceneConfig = options.scene;
  const bedroomConfig = options.bedroom;
  const { room, camera, light, sky, details } = sceneConfig;

  const pumpkinDirections = Object.fromEntries(
    [...sceneConfig.objects, ...bedroomConfig.decorations].flatMap((object) =>
      object.kind === "pumpkin"
        ? [
            [
              object.id,
              [object.facingDeg, -35, 35, 1] satisfies [
                number,
                number,
                number,
                number,
              ],
            ],
          ]
        : []
    )
  );
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
    darknessScale: [light.darknessScale, 0, 1, 0.01],
    lampGlowOpacity: [light.lampGlowOpacity, 0, 1, 0.01],
    lampFalloffOpacity: [light.lampFalloffOpacity, 0, 1, 0.01],
    lampPoolOpacity: [light.lampPoolOpacity, 0, 1, 0.01],
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

  const weatherDials = {
    condition: {
      type: "select",
      options: ["live", ...WEATHER_CONDITIONS],
      default: "live",
    },
    night: false,
    temperatureC: [18, -20, 40, 1],
    aqi: [128, 0, 400, 1],
    city: { type: "text", default: "Lisbon" },
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
    pumpkinDirections,
    ghost: {
      ...details.ghost,
      swaySeconds: [details.ghost.swaySeconds, 2, 12, 0.1],
      _collapsed: true,
    },
    skeleton: { ...details.skeleton, _collapsed: true },
    pumpkin: {
      ...details.pumpkin,
      glowIntensity: [details.pumpkin.glowIntensity, 0, 1, 0.01],
      flickerSeconds: [details.pumpkin.flickerSeconds, 1, 10, 0.1],
      _collapsed: true,
    },
    cobweb: {
      ...details.cobweb,
      opacity: [details.cobweb.opacity, 0, 1, 0.01],
      threadWidth: [details.cobweb.threadWidth, 0.2, 2, 0.05],
      _collapsed: true,
    },
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
      streakWindowMs: [details.plant.streakWindowMs, 500, 5000, 100],
      cloverStreak: [details.plant.cloverStreak, 2, 30, 1],
      maxStreak: [details.plant.maxStreak, 10, 999, 1],
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
      rainFallSeconds: [details.window.rainFallSeconds, 0.2, 4, 0.05],
      snowFallSeconds: [details.window.snowFallSeconds, 1, 20, 0.5],
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
    airPurifier: {
      minAqi: [details.airPurifier.minAqi, 0, 300, 1],
      fanSeconds: [details.airPurifier.fanSeconds, 0.2, 5, 0.1],
      airflowOpacity: [details.airPurifier.airflowOpacity, 0, 1, 0.01],
      _collapsed: true,
    },
    toyBox: {
      lightColor: details.toyBox.lightColor,
      lidFallMs: [details.toyBox.lidFallMs, 0, 3000, 10],
      boxFadeMs: [details.toyBox.boxFadeMs, 0, 3000, 10],
      plumeOpacity: [details.toyBox.plumeOpacity, 0, 1, 0.01],
      _collapsed: true,
    },
    weatherPanel: {
      glyphMotionSeconds: [
        details.weatherPanel.glyphMotionSeconds,
        0.4,
        6,
        0.1,
      ],
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

  const {
    garments,
    decorations,
    stage: _stage,
    motion,
    ...bedroomLayout
  } = bedroomConfig;

  const hamperRoomDials = {
    decorations: Object.fromEntries(
      decorations.map((object) => [
        object.id,
        { position: object.position, size: object.size, _collapsed: true },
      ])
    ),
    layout: {
      ...bedroomLayout,
      lamp: {
        ...bedroomLayout.lamp,
        glowOpacity: [bedroomLayout.lamp.glowOpacity, 0, 1, 0.01],
        fillOpacity: [bedroomLayout.lamp.fillOpacity, 0, 1, 0.01],
        poolOpacity: [bedroomLayout.lamp.poolOpacity, 0, 1, 0.01],
        bedLightOpacity: [bedroomLayout.lamp.bedLightOpacity, 0, 1, 0.01],
      },
      _collapsed: true,
    },
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

  return {
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
  };
}
