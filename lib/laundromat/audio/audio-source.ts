export type AudioState = "idle" | "buffering" | "playing" | "paused" | "error";

export type AudioStation = {
  videoId: string;
  /** Length of a recorded video; `undefined` for a live stream. */
  lengthSeconds?: number;
};

export type AudioSource = {
  play: () => void;
  pause: () => void;
  setVolume: (percent: number) => void;
  setStation: (station: AudioStation) => void;
  onStateChange: (listener: (state: AudioState) => void) => () => void;
  destroy: () => void;
};
