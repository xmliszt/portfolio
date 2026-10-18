import { jitter } from "./jitter";
import { playNoiseBurst } from "./play-noise-burst";
import type { VoiceOptions } from "./voice-options";

/** Play a toy box lid unlatching and falling open onto the floor: a small tin click, then a soft flat slap. */
export function playToyBoxOpen(options: VoiceOptions) {
  const startTimeS = options.context.currentTime + 0.005;
  playNoiseBurst({
    ...options,
    startTimeS,
    color: "white",
    filterType: "bandpass",
    frequencyHz: jitter({ value: 3200, amount: 0.1 }),
    q: 5,
    attackMs: 0.5,
    decayMs: 25,
    peak: 0.2 * options.volume,
  });
  playNoiseBurst({
    ...options,
    startTimeS: startTimeS + 0.62,
    color: "brown",
    filterType: "lowpass",
    frequencyHz: 900,
    q: 0.8,
    attackMs: 2,
    decayMs: 140,
    peak: 0.35 * options.volume,
  });
  playNoiseBurst({
    ...options,
    startTimeS: startTimeS + 0.625,
    color: "white",
    filterType: "bandpass",
    frequencyHz: 1800,
    q: 1.5,
    attackMs: 1,
    decayMs: 60,
    peak: 0.08 * options.volume,
  });
}
