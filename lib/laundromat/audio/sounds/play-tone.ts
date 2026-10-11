import { applyEnvelope } from "./apply-envelope";
import { getEnvelopePoints } from "./get-envelope-points";

/** Play one enveloped oscillator note, optionally gliding to `endFrequencyHz` and frequency-modulated by a sine at `modulatorRatio` times the carrier. */
export function playTone(options: {
  context: AudioContext;
  destination: AudioNode;
  startTimeS: number;
  type: OscillatorType;
  frequencyHz: number;
  endFrequencyHz?: number;
  glideMs?: number;
  attackMs: number;
  holdMs?: number;
  decayMs: number;
  peak: number;
  modulatorRatio?: number;
  modulationIndex?: number;
}) {
  const totalMs = options.attackMs + (options.holdMs ?? 0) + options.decayMs;
  const endTimeS = options.startTimeS + (totalMs + 30) / 1000;
  const carrier = options.context.createOscillator();
  carrier.type = options.type;
  carrier.frequency.setValueAtTime(options.frequencyHz, options.startTimeS);
  if (options.endFrequencyHz !== undefined) {
    carrier.frequency.exponentialRampToValueAtTime(
      options.endFrequencyHz,
      options.startTimeS + (options.glideMs ?? totalMs) / 1000
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
  carrier.connect(gain).connect(options.destination);
  carrier.start(options.startTimeS);
  carrier.stop(endTimeS);
  carrier.onended = () => gain.disconnect();

  if (options.modulatorRatio === undefined) return;
  const modulator = options.context.createOscillator();
  modulator.frequency.value = options.frequencyHz * options.modulatorRatio;
  const fallingModulationIndex = options.context.createGain();
  applyEnvelope({
    param: fallingModulationIndex.gain,
    points: getEnvelopePoints({
      startTimeS: options.startTimeS,
      attackMs: options.attackMs,
      decayMs: totalMs * 0.4,
      peak: options.frequencyHz * (options.modulationIndex ?? 1),
    }),
  });
  modulator.connect(fallingModulationIndex).connect(carrier.frequency);
  modulator.start(options.startTimeS);
  modulator.stop(endTimeS);
  modulator.onended = () => fallingModulationIndex.disconnect();
}
