import { playTone } from "./play-tone";
import type { VoiceOptions } from "./voice-options";

export function playSkeletonShy(options: VoiceOptions) {
  for (const delayS of [0, 0.13, 0.28]) {
    playTone({
      ...options,
      startTimeS: options.context.currentTime + 0.005 + delayS,
      type: "sine",
      frequencyHz: 700,
      endFrequencyHz: 1000,
      attackMs: 5,
      decayMs: 160,
      peak: 0.14 * options.volume,
      modulatorRatio: 2.6,
      modulationIndex: 0.6,
    });
  }
}
