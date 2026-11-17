import { playTone } from "./play-tone";
import type { VoiceOptions } from "./voice-options";

const ROCKS = [
  { offsetS: 0, peak: 0.1 },
  { offsetS: 0.15, peak: 0.06 },
  { offsetS: 0.27, peak: 0.035 },
];

/** Play a ceramic figure rocking on a hard top: three short knocks, each quieter than the last. */
export function playSnowmanWobble(options: VoiceOptions) {
  const startTimeS = options.context.currentTime + 0.005;
  ROCKS.forEach(({ offsetS, peak }) => {
    playTone({
      ...options,
      startTimeS: startTimeS + offsetS,
      type: "sine",
      frequencyHz: 640,
      endFrequencyHz: 560,
      attackMs: 2,
      decayMs: 180,
      peak: peak * options.volume,
      modulatorRatio: 2.76,
      modulationIndex: 0.9,
    });
  });
}
