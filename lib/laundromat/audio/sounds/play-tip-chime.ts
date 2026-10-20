import { playTone } from "./play-tone";
import type { VoiceOptions } from "./voice-options";

const NOTES_HZ = [523.25, 659.25, 783.99];
const NOTE_GAP_S = 0.12;

/** Play a soft three-note rising chime, C5, E5 and G5, as a thank-you. */
export function playTipChime(options: VoiceOptions) {
  const startTimeS = options.context.currentTime + 0.01;
  NOTES_HZ.forEach((frequencyHz, index) => {
    playTone({
      ...options,
      startTimeS: startTimeS + index * NOTE_GAP_S,
      type: "triangle",
      frequencyHz,
      attackMs: 6,
      decayMs: 600,
      peak: 0.05 * options.volume,
    });
  });
}
