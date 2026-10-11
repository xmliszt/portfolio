import { playNoiseBurst } from "./play-noise-burst";
import { playTone } from "./play-tone";
import type { VoiceOptions } from "./voice-options";

const CHIME_HZ = [659.3, 523.3];
const CHIME_SPACING_S = 0.42;

/** Play a shop's automatic sliding door: a motor whoosh as the glass slides open, with a two-tone entry chime over it. */
export function playSlidingDoor(options: VoiceOptions) {
  const startTimeS = options.context.currentTime + 0.005;
  playNoiseBurst({
    ...options,
    startTimeS,
    color: "pink",
    filterType: "bandpass",
    frequencyHz: 300,
    endFrequencyHz: 900,
    q: 1.5,
    attackMs: 250,
    holdMs: 400,
    decayMs: 500,
    peak: 0.12 * options.volume,
  });
  playTone({
    ...options,
    startTimeS,
    type: "triangle",
    frequencyHz: 110,
    endFrequencyHz: 140,
    attackMs: 200,
    holdMs: 500,
    decayMs: 400,
    peak: 0.03 * options.volume,
  });
  CHIME_HZ.forEach((frequencyHz, index) =>
    playTone({
      ...options,
      startTimeS: startTimeS + 0.15 + index * CHIME_SPACING_S,
      type: "sine",
      frequencyHz,
      attackMs: 4,
      decayMs: 1100,
      peak: 0.07 * options.volume,
      modulatorRatio: 3,
      modulationIndex: 0.6,
    })
  );
}
