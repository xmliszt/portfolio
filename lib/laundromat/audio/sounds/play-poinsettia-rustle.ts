import { jitter } from "./jitter";
import { playNoiseBurst } from "./play-noise-burst";
import type { VoiceOptions } from "./voice-options";

const RUSTLES_S = [0, 0.06, 0.13, 0.22, 0.3];

/** Play broad leaves brushing together: a short cluster of mid-pitched rustles. */
export function playPoinsettiaRustle(options: VoiceOptions) {
  const startTimeS = options.context.currentTime + 0.005;
  RUSTLES_S.forEach((offsetS, index) => {
    playNoiseBurst({
      ...options,
      startTimeS: startTimeS + jitter({ value: offsetS, amount: 0.2 }),
      color: "white",
      filterType: "bandpass",
      frequencyHz: jitter({ value: 2400, amount: 0.25 }),
      q: 1.1,
      attackMs: 6,
      decayMs: 60,
      peak: 0.06 * options.volume * (1 - index * 0.12),
    });
  });
}
