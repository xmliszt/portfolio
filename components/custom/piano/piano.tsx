import { PianoKey } from './piano-key';
import { PianoNote } from './piano-note.type';

export function Piano() {
  return (
    <div className='mt-32 max-w-fit rotate-90 md:rotate-0'>
      {NOTES.map((note) => (
        <PianoKey key={note} note={note} />
      ))}
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
