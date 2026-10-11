import { applyEnvelope } from "./apply-envelope";
import type { NoiseColor } from "./create-noise-buffer";
import { createNoiseBuffer } from "./create-noise-buffer";
import { getEnvelopePoints } from "./get-envelope-points";

/** Play one enveloped burst of `color` noise through a `filterType` biquad, optionally sweeping to `endFrequencyHz`. */
export function playNoiseBurst(options: {
  context: AudioContext;
  destination: AudioNode;
  startTimeS: number;
  color: NoiseColor;
  filterType: BiquadFilterType;
  frequencyHz: number;
  endFrequencyHz?: number;
  q: number;
  attackMs: number;
  holdMs?: number;
  decayMs: number;
  peak: number;
}) {
  const totalMs = options.attackMs + (options.holdMs ?? 0) + options.decayMs;
  const source = options.context.createBufferSource();
  source.buffer = createNoiseBuffer({
    context: options.context,
    durationMs: totalMs + 30,
    color: options.color,
  });
  const filter = options.context.createBiquadFilter();
  filter.type = options.filterType;
  filter.Q.value = options.q;
  filter.frequency.setValueAtTime(options.frequencyHz, options.startTimeS);
  if (options.endFrequencyHz !== undefined) {
    filter.frequency.exponentialRampToValueAtTime(
      options.endFrequencyHz,
      options.startTimeS + totalMs / 1000
    );
  }
  const gain = options.context.createGain();
  applyEnvelope({
    param: gain.gain,
    points: getEnvelopePoints({
      startTimeS: options.startTimeS,
      attackMs: options.attackMs,
      holdMs: options.holdMs,
      decayMs: options.decayMs,
      peak: options.peak,
    }),
  });
  source.connect(filter).connect(gain).connect(options.destination);
  source.start(options.startTimeS);
  source.stop(options.startTimeS + (totalMs + 30) / 1000);
  source.onended = () => gain.disconnect();
}
