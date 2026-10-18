import { jitter } from "./jitter";
import { playNoiseBurst } from "./play-noise-burst";
import type { VoiceOptions } from "./voice-options";

/** Play one short crayon scratch on paper: a gritty bandpassed white noise tick over a soft waxy rub. */
export function playCrayonScratch(options: VoiceOptions) {
  const startTimeS = options.context.currentTime + 0.002;
  const lengthMs = jitter({ value: 70, amount: 0.3 });
  playNoiseBurst({
    ...options,
    startTimeS,
    color: "white",
    filterType: "bandpass",
    frequencyHz: jitter({ value: 3200, amount: 0.25 }),
    q: 1.4,
    attackMs: 4,
    holdMs: lengthMs * 0.3,
    decayMs: lengthMs * 0.7,
    peak: jitter({ value: 0.07, amount: 0.25 }) * options.volume,
  });
  playNoiseBurst({
    ...options,
    startTimeS,
    color: "pink",
    filterType: "lowpass",
    frequencyHz: jitter({ value: 900, amount: 0.2 }),
    q: 0.7,
    attackMs: 6,
    decayMs: lengthMs,
    peak: 0.05 * options.volume,
  });
}
