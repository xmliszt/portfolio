import { jitter } from "./jitter";
import { playNoiseBurst } from "./play-noise-burst";
import type { VoiceOptions } from "./voice-options";

/** Play a short burst of tv static as the tuner jumps between stations: bright hiss with a darker crackle under it. */
export function playTvStatic(options: VoiceOptions) {
  const startTimeS = options.context.currentTime + 0.005;
  playNoiseBurst({
    ...options,
    startTimeS,
    color: "white",
    filterType: "highpass",
    frequencyHz: jitter({ value: 1800, amount: 0.15 }),
    q: 0.5,
    attackMs: 4,
    holdMs: jitter({ value: 220, amount: 0.2 }),
    decayMs: 140,
    peak: 0.22 * options.volume,
  });
  playNoiseBurst({
    ...options,
    startTimeS,
    color: "pink",
    filterType: "bandpass",
    frequencyHz: jitter({ value: 900, amount: 0.2 }),
    q: 1.2,
    attackMs: 2,
    holdMs: 180,
    decayMs: 120,
    peak: 0.12 * options.volume,
  });
}
