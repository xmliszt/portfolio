import { jitter } from "./jitter";
import { playNoiseBurst } from "./play-noise-burst";
import type { VoiceOptions } from "./voice-options";

/** Play one short cold gas puff from a small nozzle: a sharp hiss that falls away. */
export function playToyThruster(options: VoiceOptions) {
  const startTimeS = options.context.currentTime + 0.005;
  playNoiseBurst({
    ...options,
    startTimeS,
    color: "white",
    filterType: "bandpass",
    frequencyHz: jitter({ value: 4200, amount: 0.1 }),
    endFrequencyHz: 1800,
    q: 0.9,
    attackMs: 8,
    holdMs: 110,
    decayMs: 280,
    peak: 0.12 * options.volume,
  });
}
