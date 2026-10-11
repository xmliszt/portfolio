export type AudioState = "idle" | "buffering" | "playing" | "paused" | "error";

export type AudioSource = {
  play: () => void;
  pause: () => void;
  setVolume: (percent: number) => void;
  setStation: (videoId: string) => void;
  onStateChange: (listener: (state: AudioState) => void) => () => void;
  destroy: () => void;
};
