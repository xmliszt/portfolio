import type { NotebookScript } from "./supabase/notebook-types";
import type { TvStation } from "./tv/tv-state";

export type IsoPoint = { x: number; y: number; z: number };

export type IsoSize = { w: number; d: number; h: number };

type Placement = { id: string; position: IsoPoint; size: IsoSize };

export type MachineKind = "washer" | "dryer";

export type FurnitureKind =
  | "counter"
  | "coffee-machine"
  | "tv"
  | "window"
  | "clock"
  | "tube-display"
  | "shelf"
  | "table"
  | "notebook"
  | "stool"
  | "plant"
  | "basket"
  | "mug"
  | "mat"
  | "board"
  | "weather-panel"
  | "air-purifier"
  | "toy-box"
  | "toy-set";

export type SceneObject =
  | (Placement & { kind: MachineKind; number: number })
  | (Placement & { kind: FurnitureKind });

type FocusTargets = {
  shelf: { objectId: string };
  notebook: { objectId: string };
  board: { objectId: string };
  weather: { objectId: string };
};

export type FocusTarget = keyof FocusTargets;

export type NotebookPage = {
  width: number;
  height: number;
  marginX: number;
  marginTop: number;
  marginBottom: number;
  textDropRatio: number;
};

export type SkyKey = { hour: number; top: string; horizon: string };

export type DaylitToken =
  | "edge"
  | "face"
  | "faceTop"
  | "wall"
  | "wall2"
  | "shade1"
  | "shade2"
  | "recess"
  | "line"
  | "detail";

export type SceneTokens = {
  bg: string;
  panel: string;
  edge: string;
  face: string;
  faceTop: string;
  wall: string;
  wall2: string;
  shade1: string;
  shade2: string;
  recess: string;
  line: string;
  detail: string;
  ink: string;
  inkHi: string;
  accent: string;
  accentHi: string;
  paper: string;
  paperRule: string;
  inkPen: string;
  remotePen: string;
};

export type SceneConfig = {
  tokens: SceneTokens;
  room: { width: number; depth: number; wallHeight: number };
  objects: SceneObject[];
  camera: {
    focusTargets: FocusTargets;
    nearDurationMs: number;
    farDurationMs: number;
    focusPaddingRatio: number;
    roomPaddingRatio: number;
    maxFocusZoom: number;
    ease: [number, number, number, number];
    unfocusedDim: number;
  };
  light: {
    poolIntensity: number;
    lampOnDaylight: number;
    daylightPatchStrength: number;
    lampColor: string;
    daylightColor: string;
    dayTokens: { [token in DaylitToken]: string };
    daylightFillOpacity: number;
  };
  machines: {
    cycleMinutes: number[];
    defaultWasherCycleMinutes: number;
    defaultDryerCycleMinutes: number;
  };
  details: {
    machine: {
      doorOpenDeg: number;
      doorSwingMs: number;
      drumSecondsPerTurn: number;
      tumbleOpacity: number;
      displayGlow: number;
      dryerGlow: number;
      dialSettleMs: number;
    };
    tv: {
      stations: TvStation[];
      stallSeconds: number;
      noSignalMs: number;
      osdSeconds: number;
      staticMs: number;
      thumbnailDim: number;
      scanlineOpacity: number;
      scanlineDriftSeconds: number;
      vignette: number;
      flicker: number;
      defaultVolumePercent: number;
      volumeStepPercent: number;
      powerMs: number;
      screenGlow: number;
      reflection: number;
    };
    coffee: {
      flaskPortions: number;
      brewSeconds: number;
      hotMinutes: number;
      streamFlowMs: number;
      steamOpacity: number;
      steamRiseSeconds: number;
    };
    clock: {
      hourHandWidth: number;
      minuteHandWidth: number;
      glassHighlight: number;
    };
    plant: {
      swayDeg: number;
      swayMinSeconds: number;
      swayMaxSeconds: number;
      wiggleMs: number;
      streakWindowMs: number;
      cloverStreak: number;
      maxStreak: number;
    };
    shelf: { bookLean: number; spineGlow: number; bookLift: number };
    window: {
      litWindowOpacity: number;
      rainFallSeconds: number;
      snowFallSeconds: number;
    };
    board: {
      leanDeg: number;
      dayShade: number;
      frontlight: number;
      floorSpill: number;
      visibleUpdates: number;
    };
    tubeDisplay: {
      digitGlow: number;
      ghostOpacity: number;
      rollMs: number;
    };
    weatherPanel: { glyphMotionSeconds: number };
    airPurifier: { minAqi: number; fanSeconds: number; airflowOpacity: number };
    toyBox: {
      lightColor: string;
      lidFallMs: number;
      boxFadeMs: number;
      plumeOpacity: number;
    };
    notebook: {
      coverNumber: number;
      liftMs: number;
      coverOpenMs: number;
      openWaitMaxMs: number;
      coverCrackDeg: number;
      coverBreathDeg: number;
      coverBreathMs: number;
      riffleSheets: number;
      riffleStaggerMs: number;
      riffleSheetMs: number;
      turnMs: number;
      turnEase: [number, number, number, number];
      curlStrength: number;
      inkSpeed: number;
    };
  };
  notebook: {
    page: NotebookPage;
    offlineBook: { pageCount: number; linesPerPage: number };
    statusBarPx: number;
    maxChars: number;
    counterFromRatio: number;
    bookViewportFill: number;
    fontSizeRatio: { [script in NotebookScript]: number };
    doodle: {
      maxRows: number;
      strokeWidthPx: number;
      smoothing: number;
      simplifyPx: number;
      padInsetPx: number;
      replaySpeed: number;
    };
  };
  sky: {
    keys: SkyKey[];
    sunriseHour: number;
    sunsetHour: number;
    twilightHours: number;
    goldenHourElevation: number;
    sunColor: string;
    sunWarmColor: string;
    moonColor: string;
    starColor: string;
    timeJumpGlideMs: number;
  };
  street: { oppositeDistance: number; oppositeHeight: number };
};

export const sceneConfig: SceneConfig = {
  tokens: {
    bg: "#0c0d0e",
    panel: "#141516",
    edge: "#222426",
    face: "#17181a",
    faceTop: "#1b1d1f",
    wall: "#121314",
    wall2: "#101112",
    shade1: "#141517",
    shade2: "#151618",
    recess: "#0e0f10",
    line: "#3d4144",
    detail: "#2b2e30",
    ink: "#868b8f",
    inkHi: "#e6e8e9",
    accent: "#ff9a2e",
    accentHi: "#ffc77a",
    paper: "#e4dfd4",
    paperRule: "#cfc8b9",
    inkPen: "#2a2b2e",
    remotePen: "#3f7fd9",
  },
  room: { width: 14, depth: 10, wallHeight: 8 },
  objects: [
    {
      id: "washer-1",
      kind: "washer",
      number: 1,
      position: { x: 1, y: 0, z: 0 },
      size: { w: 2, d: 2, h: 2.8 },
    },
    {
      id: "washer-2",
      kind: "washer",
      number: 2,
      position: { x: 3, y: 0, z: 0 },
      size: { w: 2, d: 2, h: 2.8 },
    },
    {
      id: "washer-3",
      kind: "washer",
      number: 3,
      position: { x: 1, y: 0, z: 2.8 },
      size: { w: 2, d: 2, h: 2.8 },
    },
    {
      id: "washer-4",
      kind: "washer",
      number: 4,
      position: { x: 3, y: 0, z: 2.8 },
      size: { w: 2, d: 2, h: 2.8 },
    },
    {
      id: "dryer-1",
      kind: "dryer",
      number: 1,
      position: { x: 5.5, y: 0, z: 0 },
      size: { w: 2, d: 2, h: 2.8 },
    },
    {
      id: "dryer-2",
      kind: "dryer",
      number: 2,
      position: { x: 7.5, y: 0, z: 0 },
      size: { w: 2, d: 2, h: 2.8 },
    },
    {
      id: "dryer-3",
      kind: "dryer",
      number: 3,
      position: { x: 5.5, y: 0, z: 2.8 },
      size: { w: 2, d: 2, h: 2.8 },
    },
    {
      id: "dryer-4",
      kind: "dryer",
      number: 4,
      position: { x: 7.5, y: 0, z: 2.8 },
      size: { w: 2, d: 2, h: 2.8 },
    },
    {
      id: "counter",
      kind: "counter",
      position: { x: 10.5, y: 0, z: 0 },
      size: { w: 3, d: 1.8, h: 2.8 },
    },
    {
      id: "coffee-machine",
      kind: "coffee-machine",
      position: { x: 11.3, y: 0.2, z: 2.8 },
      size: { w: 1.4, d: 1.1, h: 1.6 },
    },
    {
      id: "clock",
      kind: "clock",
      position: { x: 11.4, y: 0, z: 6 },
      size: { w: 1.2, d: 0.15, h: 1.2 },
    },
    {
      id: "tube-display",
      kind: "tube-display",
      position: { x: 4.9, y: 0, z: 6.55 },
      size: { w: 2.4, d: 0.45, h: 0.9 },
    },
    {
      id: "shelf",
      kind: "shelf",
      position: { x: 0, y: 2.4, z: 2.5 },
      size: { w: 0.8, d: 2.4, h: 1.6 },
    },
    {
      id: "tv",
      kind: "tv",
      position: { x: 0, y: 2.8, z: 5.7 },
      size: { w: 1.2, d: 2.6, h: 1.8 },
    },
    {
      id: "window",
      kind: "window",
      position: { x: 0, y: 6.1, z: 2.4 },
      size: { w: 0.3, d: 3, h: 3.2 },
    },
    {
      id: "weather-panel",
      kind: "weather-panel",
      position: { x: 0, y: 6.2, z: 6 },
      size: { w: 0.14, d: 2.8, h: 1.6 },
    },
    {
      id: "air-purifier",
      kind: "air-purifier",
      position: { x: 0.15, y: 9.2, z: 0 },
      size: { w: 0.7, d: 0.7, h: 1.9 },
    },
    {
      id: "table",
      kind: "table",
      position: { x: 7.3, y: 6, z: 0 },
      size: { w: 2, d: 2, h: 2.4 },
    },
    {
      id: "notebook",
      kind: "notebook",
      position: { x: 7.7, y: 6.8, z: 2.4 },
      size: { w: 0.9, d: 0.7, h: 0.1 },
    },
    {
      id: "mug",
      kind: "mug",
      position: { x: 8.5, y: 6.2, z: 2.4 },
      size: { w: 0.4, d: 0.4, h: 0.34 },
    },
    {
      id: "stool-1",
      kind: "stool",
      position: { x: 6.7, y: 7.6, z: 0 },
      size: { w: 0.9, d: 0.9, h: 1.8 },
    },
    {
      id: "stool-2",
      kind: "stool",
      position: { x: 9.4, y: 6.6, z: 0 },
      size: { w: 0.9, d: 0.9, h: 1.8 },
    },
    {
      id: "plant",
      kind: "plant",
      position: { x: 12.6, y: 3, z: 0 },
      size: { w: 1.2, d: 1.2, h: 2.6 },
    },
    {
      id: "mat",
      kind: "mat",
      position: { x: 11.6, y: 8.2, z: 0 },
      size: { w: 2.2, d: 1.4, h: 0.05 },
    },
    {
      id: "board",
      kind: "board",
      position: { x: 12.15, y: 5.15, z: 0 },
      size: { w: 1.5, d: 1.5, h: 3.4 },
    },
    {
      id: "basket",
      kind: "basket",
      position: { x: 1.4, y: 3.5, z: 0 },
      size: { w: 1.4, d: 1.4, h: 1.1 },
    },
    {
      id: "toy-box",
      kind: "toy-box",
      position: { x: 0.15, y: 5.5, z: 0 },
      size: { w: 0.8, d: 3.3, h: 1.1 },
    },
    {
      id: "toy-set",
      kind: "toy-set",
      position: { x: 0.15, y: 5.5, z: 0 },
      size: { w: 0.8, d: 3.3, h: 1.95 },
    },
  ],
  camera: {
    focusTargets: {
      shelf: { objectId: "shelf" },
      notebook: { objectId: "notebook" },
      board: { objectId: "board" },
      weather: { objectId: "weather-panel" },
    },
    nearDurationMs: 500,
    farDurationMs: 800,
    focusPaddingRatio: 0.2,
    roomPaddingRatio: 0.06,
    maxFocusZoom: 3.2,
    ease: [0.22, 0.8, 0.2, 1],
    unfocusedDim: 0.35,
  },
  light: {
    poolIntensity: 0.98,
    lampOnDaylight: 0.5,
    daylightPatchStrength: 0.39,
    lampColor: "#ff9a2e",
    daylightColor: "#d6e4f0",
    dayTokens: {
      edge: "#323437",
      face: "#26272a",
      faceTop: "#2b2d30",
      wall: "#202124",
      wall2: "#1c1d20",
      shade1: "#222326",
      shade2: "#242528",
      recess: "#18191b",
      line: "#505458",
      detail: "#3b3e41",
    },
    daylightFillOpacity: 0.08,
  },
  machines: {
    cycleMinutes: [5, 10, 15, 20, 25, 30, 45, 60],
    defaultWasherCycleMinutes: 25,
    defaultDryerCycleMinutes: 5,
  },
  details: {
    machine: {
      doorOpenDeg: 100,
      doorSwingMs: 590,
      drumSecondsPerTurn: 2.4,
      tumbleOpacity: 0.26,
      displayGlow: 1,
      dryerGlow: 1,
      dialSettleMs: 180,
    },
    tv: {
      stations: [
        {
          id: "rainy-cafe",
          videoId: "c0_ejQQcrwI",
          channel: "Calmed By Nature",
          placeholder: false,
        },
        {
          id: "piano-night",
          videoId: "8dFExnve2do",
          channel: "Smooth Piano Jazz",
          placeholder: false,
        },
        {
          id: "late-wash",
          videoId: "zW5wpJY1rgQ",
          channel: "Mimi Lofi Chill",
          placeholder: false,
        },
        {
          id: "tape-hiss",
          videoId: "tiyuRJthHwc",
          channel: "chill chill journal",
          placeholder: false,
        },
        {
          id: "city-at-3am",
          videoId: "zsvYVVRAk0c",
          channel: "Nostalgic Synthwave",
          placeholder: false,
        },
        {
          id: "study-hall",
          videoId: "rFZHOHl-L8A",
          channel: "Lofi Girl",
          placeholder: false,
        },
        {
          id: "smoky-jazz",
          videoId: "E2vONfzoyRI",
          channel: "Lofi Girl",
          placeholder: false,
        },
        {
          id: "fireplace",
          videoId: "q_4KI-ChIIs",
          channel: "Lofi Girl",
          placeholder: false,
        },
        {
          id: "neon-tokyo",
          videoId: "1Tl2FtV06qo",
          channel: "Lofi Girl",
          placeholder: false,
        },
        {
          id: "string-quartet",
          videoId: "jXAEIWcGXwE",
          channel: "Lofi Girl",
          placeholder: false,
        },
        {
          id: "porch-guitar",
          videoId: "E_XmwjgRLz8",
          channel: "Lofi Girl",
          placeholder: false,
        },
        {
          id: "deep-space",
          videoId: "GSfT7H87zq4",
          channel: "Lofi Girl",
          placeholder: false,
        },
      ],
      stallSeconds: 12,
      noSignalMs: 1200,
      osdSeconds: 2.4,
      staticMs: 240,
      thumbnailDim: 0.17,
      scanlineOpacity: 0.41,
      scanlineDriftSeconds: 3,
      vignette: 0.71,
      flicker: 0.18,
      defaultVolumePercent: 60,
      volumeStepPercent: 10,
      powerMs: 360,
      screenGlow: 1,
      reflection: 0.12,
    },
    coffee: {
      flaskPortions: 5,
      brewSeconds: 40,
      hotMinutes: 6.5,
      streamFlowMs: 260,
      steamOpacity: 0.5,
      steamRiseSeconds: 3.2,
    },
    clock: { hourHandWidth: 2, minuteHandWidth: 1.25, glassHighlight: 0.08 },
    plant: {
      swayDeg: 5.65,
      swayMinSeconds: 8,
      swayMaxSeconds: 8.5,
      wiggleMs: 900,
      streakWindowMs: 2000,
      cloverStreak: 10,
      maxStreak: 99,
    },
    shelf: { bookLean: 0.14, spineGlow: 0.69, bookLift: 0.19 },
    window: {
      litWindowOpacity: 0.7,
      rainFallSeconds: 0.8,
      snowFallSeconds: 9,
    },
    board: {
      leanDeg: 8,
      dayShade: 0.3,
      frontlight: 0.12,
      floorSpill: 0.1,
      visibleUpdates: 3,
    },
    tubeDisplay: {
      digitGlow: 1,
      ghostOpacity: 0.12,
      rollMs: 900,
    },
    weatherPanel: { glyphMotionSeconds: 1.6 },
    airPurifier: { minAqi: 101, fanSeconds: 1.2, airflowOpacity: 0.22 },
    toyBox: {
      lightColor: "#ff3b30",
      lidFallMs: 700,
      boxFadeMs: 500,
      plumeOpacity: 0.55,
    },
    notebook: {
      coverNumber: 1,
      liftMs: 650,
      coverOpenMs: 950,
      openWaitMaxMs: 2400,
      coverCrackDeg: 8,
      coverBreathDeg: 4,
      coverBreathMs: 1400,
      riffleSheets: 4,
      riffleStaggerMs: 70,
      riffleSheetMs: 560,
      turnMs: 720,
      turnEase: [0.45, 0.05, 0.3, 1],
      curlStrength: 0.55,
      inkSpeed: 4,
    },
  },
  notebook: {
    page: {
      width: 500,
      height: 840,
      marginX: 52,
      marginTop: 56,
      marginBottom: 64,
      textDropRatio: 0.16,
    },
    offlineBook: { pageCount: 48, linesPerPage: 24 },
    statusBarPx: 72,
    maxChars: 1200,
    counterFromRatio: 0.8,
    bookViewportFill: 0.88,
    fontSizeRatio: {
      latin: 0.84,
      korean: 0.88,
      japanese: 0.6,
      chinese: 0.66,
      arabic: 0.7,
      hebrew: 0.6,
      devanagari: 0.66,
      bengali: 0.66,
    },
    doodle: {
      maxRows: 6,
      strokeWidthPx: 2.4,
      smoothing: 0.35,
      simplifyPx: 0.6,
      padInsetPx: 6,
      replaySpeed: 2,
    },
  },
  sky: {
    keys: [
      { hour: 0, top: "#070a14", horizon: "#111a2c" },
      { hour: 5, top: "#0b1128", horizon: "#2a2440" },
      { hour: 6, top: "#26355e", horizon: "#d98a62" },
      { hour: 7.5, top: "#4f78ad", horizon: "#efc49a" },
      { hour: 10, top: "#6a9bd0", horizon: "#bcd6ea" },
      { hour: 15, top: "#6797cb", horizon: "#c6dbea" },
      { hour: 17.5, top: "#4b5f95", horizon: "#f0a86a" },
      { hour: 18.5, top: "#2b3062", horizon: "#d9785a" },
      { hour: 19.5, top: "#141a38", horizon: "#47314d" },
      { hour: 21, top: "#080b16", horizon: "#121a2d" },
    ],
    sunriseHour: 5.75,
    sunsetHour: 19.25,
    twilightHours: 1.5,
    goldenHourElevation: 0.6,
    sunColor: "#fff3d6",
    sunWarmColor: "#ffa65c",
    moonColor: "#dfe3ea",
    starColor: "#c9d2e0",
    timeJumpGlideMs: 2000,
  },
  street: { oppositeDistance: 12, oppositeHeight: 5.5 },
};
