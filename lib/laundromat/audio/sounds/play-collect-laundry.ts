import { jitter } from "./jitter";
import { playNoiseBurst } from "./play-noise-burst";
import { randomBetween } from "./random-between";
import type { VoiceOptions } from "./voice-options";

/** Play clothes being scooped up: a low cloth whoosh with a random cluster of short high rustle grains on top. */
export function playCollectLaundry(options: VoiceOptions) {
  const startTimeS = options.context.currentTime + 0.005;
  playNoiseBurst({
    ...options,
    startTimeS,
    color: "pink",
    filterType: "lowpass",
    frequencyHz: jitter({ value: 500, amount: 0.15 }),
    endFrequencyHz: jitter({ value: 1100, amount: 0.15 }),
    q: 0.6,
    attackMs: 160,
    decayMs: 320,
    peak: 0.14 * options.volume,
  });
  const grainCount = Math.round(randomBetween({ min: 7, max: 11 }));
  Array.from({ length: grainCount }).forEach(() =>
    playNoiseBurst({
      ...options,
      startTimeS: startTimeS + randomBetween({ min: 0.02, max: 0.45 }),
      color: "white",
      filterType: "bandpass",
      frequencyHz: randomBetween({ min: 1600, max: 4800 }),
      q: randomBetween({ min: 0.8, max: 1.6 }),
      attackMs: randomBetween({ min: 4, max: 15 }),
      decayMs: randomBetween({ min: 40, max: 110 }),
      peak: randomBetween({ min: 0.03, max: 0.07 }) * options.volume,
    })
  );
}
