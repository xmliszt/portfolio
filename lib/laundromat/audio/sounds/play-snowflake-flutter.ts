import { jitter } from "./jitter";
import { playNoiseBurst } from "./play-noise-burst";
import type { VoiceOptions } from "./voice-options";

const FLUTTERS_S = [0, 0.08, 0.17, 0.27];

/** Play light paper shapes twirling on their threads: a few soft, airy flutters. */
export function playSnowflakeFlutter(options: VoiceOptions) {
  const startTimeS = options.context.currentTime + 0.005;
  FLUTTERS_S.forEach((offsetS, index) => {
    playNoiseBurst({
      ...options,
      startTimeS: startTimeS + jitter({ value: offsetS, amount: 0.15 }),
      color: "white",
      filterType: "highpass",
      frequencyHz: jitter({ value: 4200, amount: 0.15 }),
      q: 0.6,
      attackMs: 8,
      decayMs: 80,
      peak: 0.04 * options.volume * (1 - index * 0.15),
    });
  });
}
