import { jitter } from "./jitter";
import { playTone } from "./play-tone";
import type { VoiceOptions } from "./voice-options";

const STRIKES = [
  { offsetS: 0, frequencyHz: 2637 },
  { offsetS: 0.09, frequencyHz: 3136 },
  { offsetS: 0.16, frequencyHz: 2637 },
  { offsetS: 0.26, frequencyHz: 3136 },
  { offsetS: 0.38, frequencyHz: 2637 },
];

/** Play a small brass shop door bell jingling a few times as the door swings, each strike a bright inharmonic FM bell. */
export function playShopBell(options: VoiceOptions) {
  const startTimeS = options.context.currentTime + 0.005;
  STRIKES.forEach(({ offsetS, frequencyHz }, index) => {
    playTone({
      ...options,
      startTimeS: startTimeS + jitter({ value: offsetS, amount: 0.1 }),
      type: "sine",
      frequencyHz: jitter({ value: frequencyHz, amount: 0.004 }),
      attackMs: 2,
      decayMs: index === STRIKES.length - 1 ? 1100 : 600,
      peak: 0.05 * options.volume * (1 - index * 0.12),
      modulatorRatio: 2.76,
      modulationIndex: 1.4,
    });
  });
}
