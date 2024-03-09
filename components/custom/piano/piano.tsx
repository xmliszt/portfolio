'use client';

import { useState } from 'react';
import { Minus, Plus } from '@phosphor-icons/react';

import { PianoKey } from './piano-key';
import { PianoNote } from './piano-note.type';

const OCTAVE_AVAILABLE = [1, 2, 4];

export function Piano() {
  const [octave, setOctave] = useState(1);

  const isLastOctave = octave === OCTAVE_AVAILABLE[OCTAVE_AVAILABLE.length - 1];
  const isFirstOctave = octave === OCTAVE_AVAILABLE[0];

  function increaseOctave() {
    const nextIndex = OCTAVE_AVAILABLE.indexOf(octave) + 1;
    if (nextIndex <= OCTAVE_AVAILABLE.length - 1) {
      setOctave(OCTAVE_AVAILABLE[nextIndex]);
    }
  }

  function decreaseOctave() {
    const previousIndex = OCTAVE_AVAILABLE.indexOf(octave) - 1;
    if (previousIndex >= 0) {
      setOctave(OCTAVE_AVAILABLE[previousIndex]);
    }
  }

  return (
    <div>
      <div>
        {NOTES.map((note) => (
          <PianoKey key={note} note={note} octave={octave} />
        ))}
      </div>
      <div className='ml-auto mr-0 flex h-fit w-full items-center justify-end gap-4 pt-4'>
        <div>
          <span className='font-bold text-stone-100'>
            Octave{' '}
            {OCTAVE_AVAILABLE.indexOf(octave) > 0
              ? `+${OCTAVE_AVAILABLE.indexOf(octave)}`
              : ''}
          </span>
        </div>
        <div className='flex w-min items-center gap-2 rounded-lg bg-stone-100 p-2 text-stone-900'>
          <button
            onClick={decreaseOctave}
            disabled={isFirstOctave}
            className='transition-transform ease-out hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50'
          >
            <Minus size={20} />
          </button>
          <button
            onClick={increaseOctave}
            disabled={isLastOctave}
            className='transition-transform ease-out hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50'
          >
            <Plus size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

const NOTES: PianoNote[] = [
  'c6',
  'cs6',
  'd6',
  'ds6',
  'e6',
  'f6',
  'fs6',
  'g6',
  'gs6',
  'a6',
  'as6',
  'b6',
  'c7',
];
