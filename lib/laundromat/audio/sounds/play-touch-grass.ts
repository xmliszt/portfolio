import { jitter } from "./jitter";
import { playNoiseBurst } from "./play-noise-burst";
import { randomBetween } from "./random-between";
import type { VoiceOptions } from "./voice-options";

/** Play a hand brushing through leaves: a light airy sweep with a cluster of short high rustle grains. */
export function playTouchGrass(options: VoiceOptions) {
  const startTimeS = options.context.currentTime + 0.005;
  playNoiseBurst({
    ...options,
    startTimeS,
    color: "white",
    filterType: "highpass",
    frequencyHz: jitter({ value: 2200, amount: 0.15 }),
    endFrequencyHz: jitter({ value: 3800, amount: 0.15 }),
    q: 0.5,
    attackMs: 90,
    decayMs: 260,
    peak: 0.06 * options.volume,
  });
  const grainCount = Math.round(randomBetween({ min: 9, max: 14 }));
  Array.from({ length: grainCount }).forEach(() =>
    playNoiseBurst({
      ...options,
      startTimeS: startTimeS + randomBetween({ min: 0.01, max: 0.35 }),
      color: "white",
      filterType: "bandpass",
      frequencyHz: randomBetween({ min: 2600, max: 6400 }),
      q: randomBetween({ min: 1, max: 2 }),
      attackMs: randomBetween({ min: 3, max: 10 }),
      decayMs: randomBetween({ min: 25, max: 70 }),
      peak: randomBetween({ min: 0.03, max: 0.06 }) * options.volume,
    })
  );
}
