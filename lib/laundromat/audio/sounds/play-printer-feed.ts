import { jitter } from "./jitter";
import { playNoiseBurst } from "./play-noise-burst";
import { playTone } from "./play-tone";
import type { VoiceOptions } from "./voice-options";

/** Play one short step of a receipt printer feeding paper: a buzzy stepper-motor tone over a soft paper rasp. */
export function playPrinterFeed(options: VoiceOptions) {
  const startTimeS = options.context.currentTime + 0.003;
  playTone({
    ...options,
    startTimeS,
    type: "square",
    frequencyHz: jitter({ value: 430, amount: 0.05 }),
    attackMs: 3,
    holdMs: 22,
    decayMs: 18,
    peak: 0.018 * options.volume,
  });
  playNoiseBurst({
    ...options,
    startTimeS,
    color: "white",
    filterType: "bandpass",
    frequencyHz: jitter({ value: 2600, amount: 0.15 }),
    q: 1.4,
    attackMs: 4,
    decayMs: jitter({ value: 30, amount: 0.2 }),
    peak: 0.05 * options.volume,
  });
}
