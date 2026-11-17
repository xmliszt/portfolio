import { jitter } from "./jitter";
import { playNoiseBurst } from "./play-noise-burst";
import { playTone } from "./play-tone";
import type { VoiceOptions } from "./voice-options";

const SHAKES_S = [0, 0.11, 0.2, 0.34];

/** Play a small sleigh-bell jingle: a few shakes, each a metallic ping over a bright hiss. */
export function playStockingJingle(options: VoiceOptions) {
  const startTimeS = options.context.currentTime + 0.005;
  SHAKES_S.forEach((offsetS, index) => {
    const atS = startTimeS + jitter({ value: offsetS, amount: 0.1 });
    playNoiseBurst({
      ...options,
      startTimeS: atS,
      color: "white",
      filterType: "bandpass",
      frequencyHz: jitter({ value: 7000, amount: 0.1 }),
      q: 1.4,
      attackMs: 2,
      decayMs: 90,
      peak: 0.05 * options.volume * (1 - index * 0.15),
    });
    playTone({
      ...options,
      startTimeS: atS,
      type: "sine",
      frequencyHz: jitter({
        value: index % 2 === 0 ? 3520 : 4186,
        amount: 0.01,
      }),
      attackMs: 2,
      decayMs: 260,
      peak: 0.03 * options.volume * (1 - index * 0.15),
      modulatorRatio: 1.41,
      modulationIndex: 2,
    });
  });
}
