import { jitter } from "./jitter";
import { playNoiseBurst } from "./play-noise-burst";
import type { VoiceOptions } from "./voice-options";

const RATTLE_TIMES_S = [0, 0.09, 0.17];

/** Play a locked door handle tried: three quick metallic rattles against the latch. */
export function playDoorLocked(options: VoiceOptions) {
  const startTimeS = options.context.currentTime + 0.005;
  RATTLE_TIMES_S.forEach((offsetS, index) => {
    playNoiseBurst({
      ...options,
      startTimeS: startTimeS + offsetS,
      color: "white",
      filterType: "bandpass",
      frequencyHz: jitter({ value: 2200, amount: 0.12 }),
      q: 6,
      attackMs: 0.5,
      decayMs: 22,
      peak: (0.22 - index * 0.04) * options.volume,
    });
    playNoiseBurst({
      ...options,
      startTimeS: startTimeS + offsetS + 0.004,
      color: "brown",
      filterType: "lowpass",
      frequencyHz: 600,
      q: 0.7,
      attackMs: 1,
      decayMs: 35,
      peak: 0.15 * options.volume,
    });
  });
}
