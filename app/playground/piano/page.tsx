import { Metadata } from 'next';

import { openGraph } from '@/app/metadata';
import { Piano } from '@/components/custom/piano/piano';
import { Ratings } from '@/components/ui/ratings';

export function generateMetadata(): Metadata {
  return {
    title: 'Mini piano | 迷你钢琴',
    alternates: {
      canonical: '/playground/piano',
    },
    openGraph: {
      ...openGraph,
      title: 'Li Yuxuan | Mini piano',
      description:
        'A mini piano that I made with React and Framer Motion. It is a simple piano that can play C major scale.',
    },
  };
}

export default function PianoPage() {
  return (
    <div className='flex w-full flex-col items-center gap-2'>
      <h1 className='text-center font-bold'>{`I'm a mini piano`}</h1>
      <p>放慢脚步，弹弹钢琴吧！</p>
      <div className='my-32 w-max rotate-90 rounded-lg bg-stone-700 p-4 shadow-[inset_0_0_20px_10px_rgba(0,0,0,0.4),0_0_20px_10px_rgba(0,0,0,0.4)] piano:my-8 piano:rotate-0'>
        <Piano />
      </div>
      <Ratings id='piano' />
    </div>
  );
}
