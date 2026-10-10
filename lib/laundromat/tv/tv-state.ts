export type TvState = { on: boolean; station: number; volumePercent: number };

export type TvEvent =
  | { type: "power" }
  | { type: "tune"; step: 1 | -1 }
  | { type: "volume"; step: 1 | -1 };

export type TvSettings = {
  stations: string[];
  volumeStepPercent: number;
};
