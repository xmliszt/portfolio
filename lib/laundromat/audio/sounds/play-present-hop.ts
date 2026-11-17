import { playNoiseBurst } from "./play-noise-burst";
import { playTone } from "./play-tone";
import type { VoiceOptions } from "./voice-options";

/** Play a wrapped box jumping and landing: a crinkle of paper, a soft cardboard thump, then a smaller thump from the second bounce. */
export function playPresentHop(options: VoiceOptions) {
  const startTimeS = options.context.currentTime + 0.005;
  playNoiseBurst({
    ...options,
    startTimeS,
    color: "white",
    filterType: "bandpass",
    frequencyHz: 3200,
    endFrequencyHz: 4600,
    q: 0.9,
    attackMs: 15,
    decayMs: 260,
    peak: 0.07 * options.volume,
  });
  playTone({
    ...options,
    startTimeS: startTimeS + 0.42,
    type: "sine",
    frequencyHz: 140,
    endFrequencyHz: 70,
    attackMs: 3,
    decayMs: 220,
    peak: 0.16 * options.volume,
  });
  playNoiseBurst({
    ...options,
    startTimeS: startTimeS + 0.42,
    color: "pink",
    filterType: "lowpass",
    frequencyHz: 900,
    q: 0.7,
    attackMs: 2,
    decayMs: 120,
    peak: 0.08 * options.volume,
  });
  playTone({
    ...options,
    startTimeS: startTimeS + 0.67,
    type: "sine",
    frequencyHz: 120,
    endFrequencyHz: 70,
    attackMs: 3,
    decayMs: 120,
    peak: 0.06 * options.volume,
  });
}
