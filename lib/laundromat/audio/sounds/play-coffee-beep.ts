import { playTone } from "./play-tone";
import type { VoiceOptions } from "./voice-options";

const BEEP_HZ = 2093;
const BEEP_DELAY_S = 0.09;

/** Play a kitchen appliance's power-on beep: one short, slightly soft square tone just after the switch clicks. */
export function playCoffeeBeep(options: VoiceOptions) {
  playTone({
    ...options,
    startTimeS: options.context.currentTime + BEEP_DELAY_S,
    type: "square",
    frequencyHz: BEEP_HZ,
    attackMs: 3,
    holdMs: 110,
    decayMs: 40,
    peak: 0.025 * options.volume,
  });
}
