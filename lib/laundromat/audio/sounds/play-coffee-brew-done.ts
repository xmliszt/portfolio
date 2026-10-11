import { jitter } from "./jitter";
import { playNoiseBurst } from "./play-noise-burst";
import type { VoiceOptions } from "./voice-options";

/** Play a drip coffee machine finishing: a last sputter of steam that hisses out. */
export function playCoffeeBrewDone(options: VoiceOptions) {
  const startTimeS = options.context.currentTime + 0.005;
  [0, 0.12, 0.3].forEach((offsetS) =>
    playNoiseBurst({
      ...options,
      startTimeS: startTimeS + jitter({ value: offsetS + 0.01, amount: 0.2 }),
      color: "brown",
      filterType: "bandpass",
      frequencyHz: jitter({ value: 450, amount: 0.25 }),
      q: 2,
      attackMs: 5,
      decayMs: 90,
      peak: 0.25 * options.volume,
    })
  );
  playNoiseBurst({
    ...options,
    startTimeS: startTimeS + 0.1,
    color: "white",
    filterType: "highpass",
    frequencyHz: 3500,
    q: 0.5,
    attackMs: 80,
    holdMs: 400,
    decayMs: 900,
    peak: 0.06 * options.volume,
  });
}
