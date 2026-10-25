export type TvState = { on: boolean; station: number; volumePercent: number };

export type TvEvent =
  | { type: "power" }
  | { type: "tune"; step: 1 | -1 }
  | { type: "volume"; step: 1 | -1 };

export const TUNER_DETENTS = 12;

export const TV_STATION_IDS = [
  "rainy-cafe",
  "piano-night",
  "late-wash",
  "tape-hiss",
  "city-at-3am",
  "study-hall",
  "smoky-jazz",
  "fireplace",
  "neon-tokyo",
  "string-quartet",
  "porch-guitar",
  "deep-space",
  "halloween",
] as const;

export type TvStationId = (typeof TV_STATION_IDS)[number];

export type TvStation = {
  id: TvStationId;
  videoId: string;
  channel: string;
  placeholder: boolean;
};

export type TvSettings = {
  stations: TvStation[];
  volumeStepPercent: number;
};
