import { jitter } from "./jitter";
import { playNoiseBurst } from "./play-noise-burst";
import { playTone } from "./play-tone";
import type { VoiceOptions } from "./voice-options";

/** Play a ceiling light switched off: a wall switch's snap and the tube's hum cutting out. */
export function playLampOff(options: VoiceOptions) {
  const startTimeS = options.context.currentTime + 0.005;
  playNoiseBurst({
    ...options,
    startTimeS,
    color: "white",
    filterType: "bandpass",
    frequencyHz: jitter({ value: 2400, amount: 0.1 }),
    q: 3,
    attackMs: 0.5,
    decayMs: 14,
    peak: 0.25 * options.volume,
  });
  playNoiseBurst({
    ...options,
    startTimeS: startTimeS + 0.012,
    color: "brown",
    filterType: "lowpass",
    frequencyHz: 700,
    q: 0.7,
    attackMs: 1,
    decayMs: 40,
    peak: 0.2 * options.volume,
  });
  playTone({
    ...options,
    startTimeS,
    type: "sawtooth",
    frequencyHz: 100,
    endFrequencyHz: 70,
    attackMs: 1,
    decayMs: 120,
    peak: 0.03 * options.volume,
  });
}
