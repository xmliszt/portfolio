import { playTone } from "./play-tone";
import type { VoiceOptions } from "./voice-options";

export function playGhostBoo(options: VoiceOptions) {
  playTone({
    ...options,
    startTimeS: options.context.currentTime + 0.005,
    type: "sine",
    frequencyHz: 430,
    endFrequencyHz: 240,
    attackMs: 60,
    decayMs: 850,
    peak: 0.14 * options.volume,
    modulatorRatio: 1.5,
    modulationIndex: 0.6,
  });
}
