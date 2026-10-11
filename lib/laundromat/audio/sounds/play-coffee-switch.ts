import { jitter } from "./jitter";
import { playNoiseBurst } from "./play-noise-burst";
import { playTone } from "./play-tone";
import type { VoiceOptions } from "./voice-options";

/** Play a rocker switch: a crisp snap followed a few milliseconds later by a hollow plastic body thock. */
export function playCoffeeSwitch(options: VoiceOptions) {
  const startTimeS = options.context.currentTime + 0.005;
  const thockTimeS = startTimeS + jitter({ value: 0.007, amount: 0.3 });
  playNoiseBurst({
    ...options,
    startTimeS,
    color: "white",
    filterType: "bandpass",
    frequencyHz: jitter({ value: 3000, amount: 0.1 }),
    q: 2,
    attackMs: 0.4,
    decayMs: 8,
    peak: 0.22 * options.volume,
  });
  playNoiseBurst({
    ...options,
    startTimeS: thockTimeS,
    color: "white",
    filterType: "bandpass",
    frequencyHz: jitter({ value: 900, amount: 0.08 }),
    q: 4,
    attackMs: 1,
    decayMs: 35,
    peak: 0.15 * options.volume,
  });
  playTone({
    ...options,
    startTimeS: thockTimeS,
    type: "sine",
    frequencyHz: jitter({ value: 185, amount: 0.05 }),
    endFrequencyHz: 150,
    attackMs: 1,
    decayMs: 40,
    peak: 0.07 * options.volume,
  });
}
