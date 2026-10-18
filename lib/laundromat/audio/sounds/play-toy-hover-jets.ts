import { playNoiseBurst } from "./play-noise-burst";
import type { VoiceOptions } from "./voice-options";

/** Play four cold gas jets holding the toy car up as it sinks to the floor: a steady hiss that softens at touchdown. */
export function playToyHoverJets(options: VoiceOptions) {
  const startTimeS = options.context.currentTime + 0.005;
  playNoiseBurst({
    ...options,
    startTimeS,
    color: "white",
    filterType: "bandpass",
    frequencyHz: 3600,
    endFrequencyHz: 2000,
    q: 0.7,
    attackMs: 90,
    holdMs: 780,
    decayMs: 260,
    peak: 0.1 * options.volume,
  });
  playNoiseBurst({
    ...options,
    startTimeS,
    color: "pink",
    filterType: "lowpass",
    frequencyHz: 1200,
    q: 0.7,
    attackMs: 120,
    holdMs: 700,
    decayMs: 300,
    peak: 0.06 * options.volume,
  });
}
