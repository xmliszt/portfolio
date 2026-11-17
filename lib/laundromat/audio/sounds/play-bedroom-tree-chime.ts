import { jitter } from "./jitter";
import { playTone } from "./play-tone";
import type { VoiceOptions } from "./voice-options";

const NOTES_HZ = [1319, 1568, 2093];

/** Play three quiet rising glass chimes. */
export function playBedroomTreeChime(options: VoiceOptions) {
  const startTimeS = options.context.currentTime + 0.005;
  NOTES_HZ.forEach((frequencyHz, index) => {
    playTone({
      ...options,
      startTimeS: startTimeS + jitter({ value: index * 0.09, amount: 0.08 }),
      type: "sine",
      frequencyHz,
      attackMs: 3,
      decayMs: 700,
      peak: 0.032 * options.volume,
      modulatorRatio: 3.5,
      modulationIndex: 0.8,
    });
  });
}
