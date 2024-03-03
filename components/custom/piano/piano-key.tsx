'use client';

import { cn } from '@/lib/utils';

import { PianoNote } from './piano-note.type';
import { usePianoSound } from './use-piano-sound';

import './piano-key.css';

type PianoKeyProps = {
  note: PianoNote;
};

export function PianoKey(props: PianoKeyProps) {
  const [play] = usePianoSound(props.note);

  function keyColor(note: PianoNote): 'white' | 'black' {
    const blackNotes: PianoNote[] = ['cs6', 'ds6', 'fs6', 'gs6', 'as6'];
    return blackNotes.includes(note) ? 'black' : 'white';
  }

  function isDEGABKey(note: PianoNote): boolean {
    const degabNotes: PianoNote[] = ['d6', 'e6', 'g6', 'a6', 'b6'];
    return degabNotes.includes(note);
  }

  function isFirstKey(note: PianoNote): boolean {
    return note === 'c6';
  }

  function isLastKey(note: PianoNote): boolean {
    return note === 'c7';
  }

  return (
    <button
      className={cn(
        'relative float-left m-0 list-none p-0',
        (() => {
          switch (keyColor(props.note)) {
            case 'white':
              return 'white text-slate-800';
            case 'black':
              return 'black text-slate-100';
          }
        })(),
        isDEGABKey(props.note) && 'degab-key',
        isFirstKey(props.note) && '!rounded-tl-lg',
        isLastKey(props.note) && '!rounded-tr-lg'
      )}
      onClick={() => play()}
    >
      {props.note}
    </button>
  );
}
