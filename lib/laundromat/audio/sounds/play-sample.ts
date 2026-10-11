import { jitter } from "./jitter";
import type { VoiceOptions } from "./voice-options";

const PLAYBACK_RATE_JITTER = 0.03;
const FADE_FROM_RATIO = 0.4;

/** Play `buffer` once at `volume`, slightly varying its pitch so repeats do not sound identical, and when `lengthMs` is set fade it out and stop it at that length. */
export function playSample(
  options: VoiceOptions & { buffer: AudioBuffer; lengthMs?: number }
) {
  const source = options.context.createBufferSource();
  source.buffer = options.buffer;
  source.playbackRate.value = jitter({
    value: 1,
    amount: PLAYBACK_RATE_JITTER,
  });
  const gain = options.context.createGain();
  const startS = options.context.currentTime;
  gain.gain.setValueAtTime(options.volume, startS);
  source.connect(gain).connect(options.destination);
  source.onended = () => gain.disconnect();
  source.start(startS);
  if (options.lengthMs === undefined) return;
  const endS = startS + options.lengthMs / 1000;
  gain.gain.setValueAtTime(
    options.volume,
    startS + (options.lengthMs * FADE_FROM_RATIO) / 1000
  );
  gain.gain.linearRampToValueAtTime(0, endS);
  source.stop(endS);
}
