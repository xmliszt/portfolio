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
  | "shelf"
  | "table"
  | "notebook"
  | "stool"
  | "plant"
  | "basket";

export type SceneObject =
  | (Placement & { kind: MachineKind; number: number })
  | (Placement & { kind: FurnitureKind });

type FocusTargets = {
  shelf: { objectId: string };
  notebook: { objectId: string };
};

export type FocusTarget = keyof FocusTargets;

export type SkyKey = { hour: number; top: string; horizon: string };

export type SceneTokens = {
  bg: string;
  panel: string;
  edge: string;
  face: string;
  faceTop: string;
  wall: string;
  wall2: string;
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
    lampNoonRatio: number;
    daylightPatchStrength: number;
  };
  machines: {
    washerCycleMinutes: number[];
    dryerCycleMinutes: number[];
    defaultWasherCycleMinutes: number;
    defaultDryerCycleMinutes: number;
  };
  sky: {
    keys: SkyKey[];
    sunriseHour: number;
    sunsetHour: number;
    timeJumpGlideMs: number;
  };
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
  },
  room: { width: 14, depth: 10, wallHeight: 8 },
  objects: [
    {
      id: "washer-1",
      kind: "washer",
      number: 1,
      position: { x: 1, y: 0, z: 0 },
      size: { w: 2, d: 2, h: 2.6 },
    },
    {
      id: "washer-2",
      kind: "washer",
      number: 2,
      position: { x: 3, y: 0, z: 0 },
      size: { w: 2, d: 2, h: 2.6 },
    },
    {
      id: "washer-3",
      kind: "washer",
      number: 3,
      position: { x: 1, y: 0, z: 2.6 },
      size: { w: 2, d: 2, h: 2.6 },
    },
    {
      id: "washer-4",
      kind: "washer",
      number: 4,
      position: { x: 3, y: 0, z: 2.6 },
      size: { w: 2, d: 2, h: 2.6 },
    },
    {
      id: "dryer-1",
      kind: "dryer",
      number: 1,
      position: { x: 5.5, y: 0, z: 0 },
      size: { w: 2, d: 2, h: 2.6 },
    },
    {
      id: "dryer-2",
      kind: "dryer",
      number: 2,
      position: { x: 7.5, y: 0, z: 0 },
      size: { w: 2, d: 2, h: 2.6 },
    },
    {
      id: "dryer-3",
      kind: "dryer",
      number: 3,
      position: { x: 5.5, y: 0, z: 2.6 },
      size: { w: 2, d: 2, h: 2.6 },
    },
    {
      id: "dryer-4",
      kind: "dryer",
      number: 4,
      position: { x: 7.5, y: 0, z: 2.6 },
      size: { w: 2, d: 2, h: 2.6 },
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
      position: { x: 11.4, y: 0.3, z: 2.8 },
      size: { w: 1.2, d: 1, h: 1.4 },
    },
    {
      id: "clock",
      kind: "clock",
      position: { x: 11.4, y: 0, z: 6 },
      size: { w: 1.2, d: 0.15, h: 1.2 },
    },
    {
      id: "shelf",
      kind: "shelf",
      position: { x: 0, y: 0.8, z: 3.6 },
      size: { w: 0.8, d: 2.4, h: 1.6 },
    },
    {
      id: "tv",
      kind: "tv",
      position: { x: 0, y: 3.6, z: 4.8 },
      size: { w: 1.2, d: 1.8, h: 1.5 },
    },
    {
      id: "window",
      kind: "window",
      position: { x: 0, y: 6, z: 2.4 },
      size: { w: 0.3, d: 3, h: 3.2 },
    },
    {
      id: "table",
      kind: "table",
      position: { x: 7, y: 6, z: 0 },
      size: { w: 2, d: 2, h: 2.4 },
    },
    {
      id: "notebook",
      kind: "notebook",
      position: { x: 7.6, y: 6.6, z: 2.4 },
      size: { w: 0.9, d: 0.7, h: 0.1 },
    },
    {
      id: "stool-1",
      kind: "stool",
      position: { x: 5.6, y: 6.4, z: 0 },
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
      position: { x: 12.4, y: 3, z: 0 },
      size: { w: 1.2, d: 1.2, h: 2.6 },
    },
    {
      id: "basket",
      kind: "basket",
      position: { x: 3, y: 4, z: 0 },
      size: { w: 1.4, d: 1.4, h: 1.1 },
    },
  ],
  camera: {
    focusTargets: {
      shelf: { objectId: "shelf" },
      notebook: { objectId: "notebook" },
    },
    nearDurationMs: 500,
    farDurationMs: 800,
    focusPaddingRatio: 0.2,
    roomPaddingRatio: 0.06,
    maxFocusZoom: 3.2,
    ease: [0.22, 0.8, 0.2, 1],
    unfocusedDim: 0.35,
  },
  light: { poolIntensity: 1, lampNoonRatio: 0.5, daylightPatchStrength: 0.12 },
  machines: {
    washerCycleMinutes: [25, 30, 45, 60],
    dryerCycleMinutes: [5, 10, 15],
    defaultWasherCycleMinutes: 30,
    defaultDryerCycleMinutes: 10,
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
    timeJumpGlideMs: 2000,
  },
};
