import { jitter } from "./jitter";
import { playTone } from "./play-tone";
import type { VoiceOptions } from "./voice-options";

const NOTES_HZ = [1046.5, 1318.5, 1568];
const NOTE_SPACING_S = 0.24;

/** Play a gentle rising three-note appliance chime, each note a soft two-operator FM bell. */
export function playDoneDing(options: VoiceOptions) {
  const startTimeS = options.context.currentTime + 0.005;
  NOTES_HZ.forEach((frequencyHz, index) => {
    const isLast = index === NOTES_HZ.length - 1;
    playTone({
      ...options,
      startTimeS: startTimeS + index * NOTE_SPACING_S,
      type: "sine",
      frequencyHz: jitter({ value: frequencyHz, amount: 0.002 }),
      attackMs: 6,
      decayMs: isLast ? 1300 : 800,
      peak: 0.075 * options.volume,
      modulatorRatio: 2,
      modulationIndex: 0.9,
    });
  });
}
