'use client';

import { useRef } from 'react';
import { isMobile, isTablet } from 'react-device-detect';
import Image from 'next/image';

import { cn } from '@/lib/utils';

export function WavingAvatar() {
  const avatarImageRef = useRef<HTMLImageElement>(null);
  const greetingRef = useRef<HTMLSpanElement>(null);

  function toggleWave() {
    // Only toggle wave animation on mobile and tablet on touch
    if (isMobile || isTablet) {
      avatarImageRef.current?.classList.toggle('animate-wave');
      greetingRef.current?.classList.toggle('animate-greet');
      greetingRef.current?.classList.remove('duration-300');
      greetingRef.current?.classList.add('duration-[1200ms]');
    } else {
      greetingRef.current?.classList.remove('duration-[1200ms]');
      greetingRef.current?.classList.add('duration-300');
    }
  }

  return (
    <div className='group relative' onTouchStart={toggleWave}>
      <Image
        ref={avatarImageRef}
        className='z-10 rounded-full border bg-background shadow-lg group-hover:animate-wave'
        src='https://github.com/xmliszt/resources/blob/main/portfolio/avatar.png?raw=true'
        alt='Li Yuxuan avatar'
        width={150}
        height={150}
        unoptimized
      />
      <span
        ref={greetingRef}
        className={cn(
          'absolute right-0 top-14 -z-10 translate-x-0 translate-y-0 -rotate-12 whitespace-nowrap opacity-0 transition-all duration-300 ease-out',
          'group-hover:translate-x-[100px] group-hover:translate-y-[-50px] group-hover:rotate-6 group-hover:scale-110 group-hover:opacity-100'
        )}
      >
        {`~ Nothing is impossible 💥`}
      </span>
    </div>
  );
}
