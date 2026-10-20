import { jitter } from "./jitter";
import { playNoiseBurst } from "./play-noise-burst";
import { playTone } from "./play-tone";
import type { VoiceOptions } from "./voice-options";

const CLINK_OFFSETS_S = [0.03, 0.07, 0.12];

/** Play a coin landing in a glass jar of coins: a glassy tink, then a small muffled clatter as it settles. */
export function playJarCoin(options: VoiceOptions) {
  const startTimeS = options.context.currentTime + 0.005;
  playTone({
    ...options,
    startTimeS,
    type: "sine",
    frequencyHz: jitter({ value: 3400, amount: 0.04 }),
    attackMs: 0.5,
    decayMs: 220,
    peak: 0.05 * options.volume,
  });
  playNoiseBurst({
    ...options,
    startTimeS,
    color: "pink",
    filterType: "bandpass",
    frequencyHz: 800,
    q: 4,
    attackMs: 1,
    decayMs: 160,
    peak: 0.12 * options.volume,
  });
  CLINK_OFFSETS_S.forEach((offsetS, index) => {
    playTone({
      ...options,
      startTimeS: startTimeS + offsetS,
      type: "sine",
      frequencyHz: jitter({ value: 2600, amount: 0.15 }),
      attackMs: 0.5,
      decayMs: 120,
      peak: (0.03 - index * 0.007) * options.volume,
    });
  });
}
