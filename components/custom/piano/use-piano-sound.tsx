'use client';

import useSound from 'use-sound';

import { PianoNote } from './piano-note.type';

export function usePianoSound(note: PianoNote) {
  return useSound(`/static/piano-sounds/${note}.mp3`, { volume: 0.5 });
}
