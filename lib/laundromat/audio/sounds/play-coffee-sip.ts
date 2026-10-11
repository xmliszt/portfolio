import { jitter } from "./jitter";
import { playNoiseBurst } from "./play-noise-burst";
import type { VoiceOptions } from "./voice-options";

/** Play a sip from a mug: a short airy slurp swept upward, then a soft low gulp. */
export function playCoffeeSip(options: VoiceOptions) {
  const startTimeS = options.context.currentTime + 0.005;
  const slurpMs = jitter({ value: 260, amount: 0.15 });
  playNoiseBurst({
    ...options,
    startTimeS,
    color: "white",
    filterType: "bandpass",
    frequencyHz: jitter({ value: 1300, amount: 0.15 }),
    endFrequencyHz: jitter({ value: 2600, amount: 0.15 }),
    q: 1.4,
    attackMs: slurpMs * 0.4,
    decayMs: slurpMs * 0.6,
    peak: 0.1 * options.volume,
  });
  playNoiseBurst({
    ...options,
    startTimeS: startTimeS + slurpMs / 1000 + 0.18,
    color: "pink",
    filterType: "lowpass",
    frequencyHz: jitter({ value: 320, amount: 0.15 }),
    q: 1.2,
    attackMs: 12,
    decayMs: 110,
    peak: 0.18 * options.volume,
  });
}
