import { Metadata } from 'next';

import { Piano } from '@/components/custom/piano/piano';

export function generateMetadata(): Metadata {
  return {
    title: 'Piano | 弹弹钢琴',
  };
}

export default function PianoPage() {
  return (
    <div className='flex w-full flex-col items-center gap-2'>
      <h1 className='text-center font-bold'>Play some music! 弹弹钢琴</h1>
      <div className='my-32 w-max rotate-90 rounded-lg bg-stone-700 p-4 shadow-[inset_0_0_20px_10px_rgba(0,0,0,0.4),0_0_20px_10px_rgba(0,0,0,0.4)] piano:my-8 piano:rotate-0'>
        <Piano />
      </div>
    </div>
  );
}
