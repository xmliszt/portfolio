export type VoiceOptions = {
  context: AudioContext;
  destination: AudioNode;
  volume: number;
};

export type LoopHandle = { stop(fadeMs: number): void };
