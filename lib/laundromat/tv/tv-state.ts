export type TvState = { on: boolean; station: number; volumePercent: number };

export type TvEvent =
  | { type: "power" }
  | { type: "tune"; step: 1 | -1 }
  | { type: "volume"; step: 1 | -1 };

export type TvStation = {
  label: string;
  videoId: string;
  channel: string;
  placeholder: boolean;
};

export type TvSettings = {
  stations: TvStation[];
  volumeStepPercent: number;
};
