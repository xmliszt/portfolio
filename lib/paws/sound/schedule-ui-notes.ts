import type { UiNote } from "./ui-sounds";

const DEFAULT_ATTACK_S = 0.004;

/** Schedule `notes` into `destination` from `startAt` seconds on `context`, each a short enveloped tone with an optional pitch sweep and overtone, disconnecting every node when it ends. */
export function scheduleUiNotes(options: {
  context: BaseAudioContext;
  destination: AudioNode;
  notes: readonly UiNote[];
  startAt: number;
}) {
  const { context, destination } = options;
  for (const note of options.notes) {
    const at = options.startAt + note.at;
    const attack = note.attack ?? DEFAULT_ATTACK_S;
    const endsAt = at + attack + note.decay;
    const tone = context.createOscillator();
    tone.type = note.type;
    tone.frequency.setValueAtTime(note.freq, at);
    if (note.sweepTo !== undefined)
      tone.frequency.exponentialRampToValueAtTime(
        note.sweepTo,
        at + note.decay * 0.8
      );
    const envelope = context.createGain();
    envelope.gain.setValueAtTime(0.0001, at);
    envelope.gain.linearRampToValueAtTime(note.gain, at + attack);
    envelope.gain.exponentialRampToValueAtTime(0.0001, endsAt);
    tone.connect(envelope);
    envelope.connect(destination);
    tone.start(at);
    tone.stop(endsAt + 0.05);
    tone.onended = () => {
      tone.disconnect();
      envelope.disconnect();
    };
    if (note.harmonic === undefined) continue;
    const overtone = context.createOscillator();
    overtone.frequency.setValueAtTime(note.freq * note.harmonic, at);
    const overtoneGain = context.createGain();
    overtoneGain.gain.setValueAtTime(note.gain * 0.25, at);
    overtoneGain.gain.exponentialRampToValueAtTime(
      0.0001,
      at + note.decay * 0.5
    );
    overtone.connect(overtoneGain);
    overtoneGain.connect(destination);
    overtone.start(at);
    overtone.stop(endsAt + 0.05);
    overtone.onended = () => {
      overtone.disconnect();
      overtoneGain.disconnect();
    };
  }
}
