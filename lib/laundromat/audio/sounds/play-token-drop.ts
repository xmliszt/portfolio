import { jitter } from "./jitter";
import { playNoiseBurst } from "./play-noise-burst";
import { playTone } from "./play-tone";
import type { VoiceOptions } from "./voice-options";

const PARTIALS_HZ = [1800, 2900, 4300];
const BOUNCES = [
  { offsetS: 0.32, peak: 1 },
  { offsetS: 0.41, peak: 0.55 },
  { offsetS: 0.48, peak: 0.3 },
];

/** Play a brass token dropping from the coin machine into its metal tray: a soft mechanical kachunk, then three clinks that ring out and settle. */
export function playTokenDrop(options: VoiceOptions) {
  const startTimeS = options.context.currentTime + 0.005;
  playNoiseBurst({
    ...options,
    startTimeS,
    color: "brown",
    filterType: "lowpass",
    frequencyHz: 600,
    q: 1,
    attackMs: 2,
    holdMs: 30,
    decayMs: 90,
    peak: 0.28 * options.volume,
  });
  BOUNCES.forEach((bounce) => {
    PARTIALS_HZ.forEach((frequencyHz, index) => {
      playTone({
        ...options,
        startTimeS: startTimeS + bounce.offsetS,
        type: "sine",
        frequencyHz: jitter({ value: frequencyHz, amount: 0.02 }),
        attackMs: 1,
        decayMs: 420 - index * 90,
        peak: (0.05 / (index + 1)) * bounce.peak * options.volume,
      });
    });
  });
}
