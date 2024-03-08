'use client';

import { useRef } from 'react';
import { isMobile, isTablet } from 'react-device-detect';
import Image from 'next/image';

export function WavingAvatar() {
  const avatarImageRef = useRef<HTMLImageElement>(null);
  const greetingRef = useRef<HTMLSpanElement>(null);

  function toggleWave() {
    // Only toggle wave animation on mobile and tablet on touch
    if (isMobile || isTablet) {
      avatarImageRef.current?.classList.toggle('animate-wave');
      greetingRef.current?.classList.toggle('animate-greet');
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
        className='absolute right-0 top-14 -z-10 opacity-0 group-hover:animate-greet'
      >
        ~ Yo! Whatssup! 👋🏻
      </span>
    </div>
  );
}
