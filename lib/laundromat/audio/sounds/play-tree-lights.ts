import { jitter } from "./jitter";
import { playTone } from "./play-tone";
import type { VoiceOptions } from "./voice-options";

const NOTES_HZ = [1047, 1319, 1568, 1760, 2093, 2637];

/** Play a rising run of six soft glass chimes. */
export function playTreeLights(options: VoiceOptions) {
  const startTimeS = options.context.currentTime + 0.005;
  NOTES_HZ.forEach((frequencyHz, index) => {
    playTone({
      ...options,
      startTimeS: startTimeS + jitter({ value: index * 0.075, amount: 0.08 }),
      type: "sine",
      frequencyHz,
      attackMs: 3,
      decayMs: index === NOTES_HZ.length - 1 ? 1200 : 650,
      peak: 0.05 * options.volume,
      modulatorRatio: 3.5,
      modulationIndex: 0.9,
    });
  });
}
