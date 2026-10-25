import { playTone } from "./play-tone";
import type { VoiceOptions } from "./voice-options";

export function playPumpkinTap(options: VoiceOptions) {
  playTone({
    ...options,
    startTimeS: options.context.currentTime + 0.005,
    type: "sine",
    frequencyHz: 190,
    endFrequencyHz: 85,
    attackMs: 5,
    decayMs: 450,
    peak: 0.14 * options.volume,
    modulatorRatio: 1.5,
    modulationIndex: 0.6,
  });
}
